import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { catchAllPatchSchema } from "@/lib/validators";
import { Domain, Mailbox, ActivityLog } from "@/models";

export async function PATCH(req: Request, { params }: { params: Promise<{ domainId: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const { domainId } = await params;
  const parsed = catchAllPatchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (!session.user.organizationId) return NextResponse.json({ error: "Organization context missing" }, { status: 400 });

  await connectToDatabase();
  const domain = await Domain.findOne({ _id: domainId, organizationId: session.user.organizationId });
  if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

  if (parsed.data.catchAllEnabled) {
    if (!parsed.data.catchAllMailboxId) return NextResponse.json({ error: "catchAllMailboxId required" }, { status: 400 });
    const mailbox = await Mailbox.findOne({
      _id: new mongoose.Types.ObjectId(parsed.data.catchAllMailboxId),
      organizationId: session.user.organizationId,
      domainId: domain._id,
    }).lean();
    if (!mailbox) return NextResponse.json({ error: "Mailbox not found for domain" }, { status: 404 });
    domain.catchAllEnabled = true;
    domain.catchAllMailboxId = mailbox._id;
  } else {
    domain.catchAllEnabled = false;
    domain.catchAllMailboxId = null as any;
  }

  await domain.save();

  await ActivityLog.create({
    organizationId: session.user.organizationId,
    userId: session.user.id,
    action: "DOMAIN_CATCHALL_UPDATED",
    metadata: { domain: domain.domain, enabled: domain.catchAllEnabled, mailboxId: domain.catchAllMailboxId },
  });

  return NextResponse.json(domain);
}

