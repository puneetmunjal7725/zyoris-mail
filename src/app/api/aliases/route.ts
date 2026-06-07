import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { aliasCreateSchema } from "@/lib/validators";
import { Alias, Mailbox, Domain, ActivityLog, Organization } from "@/models";
import { isWithinLimit } from "@/lib/plan-limits";

export async function GET() {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
  await connectToDatabase();
  const mailboxes = await Mailbox.find({ organizationId: session.user.organizationId }).select({ _id: 1 }).lean();
  const mailboxIds = mailboxes.map((m) => m._id);
  const rows = await Alias.find({ mailboxId: { $in: mailboxIds } }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const parsed = aliasCreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();

  const org = await Organization.findById(session.user.organizationId).lean();
  if (!org || org.isActive === false) return NextResponse.json({ error: "Organization not active" }, { status: 403 });

  const mailboxes = await Mailbox.find({ organizationId: session.user.organizationId }).select({ _id: 1 }).lean();
  const aliasCount = await Alias.countDocuments({ mailboxId: { $in: mailboxes.map((m) => m._id) } });
  if (!isWithinLimit(aliasCount, org.aliasLimit)) {
    return NextResponse.json({ error: "Alias limit exceeded" }, { status: 403 });
  }

  const mailbox = await Mailbox.findOne({ _id: parsed.data.mailboxId, organizationId: session.user.organizationId }).lean();
  if (!mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });

  const [_, srcDomain] = parsed.data.sourceAddress.split("@");
  const [__, destDomain] = parsed.data.destinationAddress.split("@");
  if (!srcDomain || !destDomain) return NextResponse.json({ error: "Invalid address" }, { status: 400 });

  const domainRow = await Domain.findOne({ domain: srcDomain.toLowerCase(), organizationId: session.user.organizationId }).lean();
  if (!domainRow) return NextResponse.json({ error: "Source domain not found" }, { status: 404 });

  const alias = await Alias.create({
    mailboxId: mailbox._id,
    sourceAddress: parsed.data.sourceAddress,
    destinationAddress: parsed.data.destinationAddress,
    isEnabled: parsed.data.isEnabled ?? true,
  });

  await ActivityLog.create({
    organizationId: session.user.organizationId,
    userId: session.user.id,
    action: "ALIAS_CREATED",
    metadata: { aliasId: alias._id, source: alias.sourceAddress, destination: alias.destinationAddress },
  });

  return NextResponse.json(alias, { status: 201 });
}

