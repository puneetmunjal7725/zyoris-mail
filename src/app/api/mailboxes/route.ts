import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { mailboxCreateSchema } from "@/lib/validators";
import { Domain, Mailbox, Organization, ActivityLog } from "@/models";

export async function GET() {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
  await connectToDatabase();
  const rows = await Mailbox.find({ organizationId: session.user.organizationId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
    const parsed = mailboxCreateSchema.safeParse(await req.json());
    if (!parsed.success) {
      const fieldErrors = Object.values(parsed.error.flatten().fieldErrors).flat();
      return NextResponse.json({ error: fieldErrors[0] || "Invalid mailbox data" }, { status: 400 });
    }
    if (!session.user.organizationId) return NextResponse.json({ error: "Organization context missing" }, { status: 400 });

    await connectToDatabase();

    const org = await Organization.findById(session.user.organizationId).lean();
    if (!org || org.isActive === false) return NextResponse.json({ error: "Organization not active" }, { status: 403 });

    const mailboxCount = await Mailbox.countDocuments({ organizationId: session.user.organizationId });
    if (org.mailboxLimit && mailboxCount >= org.mailboxLimit) {
      return NextResponse.json({ error: "You have reached your mailbox limit" }, { status: 403 });
    }

    const domain = await Domain.findOne({ _id: parsed.data.domainId, organizationId: session.user.organizationId }).lean();
    if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    if (domain.status !== "VERIFIED") return NextResponse.json({ error: "Domain must be verified before creating team emails" }, { status: 400 });

    const emailAddress = `${parsed.data.username.toLowerCase()}@${domain.domain}`.toLowerCase();
    const taken = await Mailbox.findOne({ emailAddress }).lean();
    if (taken) return NextResponse.json({ error: "This email address is already taken" }, { status: 409 });

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);

    const mailbox = await Mailbox.create({
      organizationId: session.user.organizationId,
      domainId: domain._id,
      emailAddress,
      username: parsed.data.username.toLowerCase(),
      displayName: parsed.data.displayName,
      passwordHash,
      storageLimitBytes: parsed.data.storageLimitBytes,
      isActive: true,
      isSuspended: false,
    });

    await ActivityLog.create({
      organizationId: session.user.organizationId,
      userId: session.user.id,
      action: "MAILBOX_CREATED",
      metadata: { mailboxId: mailbox._id, emailAddress: mailbox.emailAddress },
    });

    return NextResponse.json(mailbox, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
      return NextResponse.json({ error: "This email address is already taken" }, { status: 409 });
    }
    console.error("Mailbox create failed:", err);
    return NextResponse.json({ error: "Failed to create team email" }, { status: 500 });
  }
}

