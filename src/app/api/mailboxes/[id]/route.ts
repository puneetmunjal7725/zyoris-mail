import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { mailboxPatchSchema } from "@/lib/validators";
import { Mailbox, ActivityLog } from "@/models";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
  const { id } = await params;
  await connectToDatabase();
  const mailbox = await Mailbox.findOne({ _id: id, organizationId: session.user.organizationId }).lean();
  if (!mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
  return NextResponse.json(mailbox);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const { id } = await params;
  const parsed = mailboxPatchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await connectToDatabase();

  const mailbox = await Mailbox.findOne({ _id: id, organizationId: session.user.organizationId });
  if (!mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });

  if (typeof parsed.data.displayName === "string") mailbox.displayName = parsed.data.displayName;
  if (parsed.data.suspend) {
    mailbox.isSuspended = true;
    mailbox.isActive = false;
  }
  if (parsed.data.reactivate) {
    mailbox.isSuspended = false;
    mailbox.isActive = true;
  }
  if (typeof parsed.data.resetPassword === "string") {
    mailbox.passwordHash = await bcrypt.hash(parsed.data.resetPassword, 12);
  }

  await mailbox.save();

  await ActivityLog.create({
    organizationId: session.user.organizationId,
    userId: session.user.id,
    action: "MAILBOX_UPDATED",
    metadata: { mailboxId: mailbox._id, emailAddress: mailbox.emailAddress },
  });

  return NextResponse.json(mailbox);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const { id } = await params;
  await connectToDatabase();
  const mailbox = await Mailbox.findOneAndDelete({ _id: id, organizationId: session.user.organizationId });
  if (!mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });

  await ActivityLog.create({
    organizationId: session.user.organizationId,
    userId: session.user.id,
    action: "MAILBOX_DELETED",
    metadata: { mailboxId: mailbox._id, emailAddress: mailbox.emailAddress },
  });

  return NextResponse.json({ ok: true });
}

