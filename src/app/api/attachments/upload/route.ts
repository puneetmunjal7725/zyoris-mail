import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { uploadObject } from "@/lib/services/storage";
import { Attachment, Mailbox, Organization } from "@/models";
import { checkMailboxQuota } from "@/lib/mailbox-routing";

export async function POST(req: Request) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
  if (!session.user.organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const form = await req.formData();
  const mailboxId = String(form.get("mailboxId") || "");
  if (!mailboxId) return NextResponse.json({ error: "mailboxId is required" }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file is required" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  await connectToDatabase();
  const mailbox = await Mailbox.findOne({ _id: mailboxId, organizationId: session.user.organizationId });
  if (!mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
  if (!mailbox.isActive || mailbox.isSuspended) return NextResponse.json({ error: "Mailbox suspended" }, { status: 403 });
  const quota = checkMailboxQuota(mailbox.toObject(), bytes.length);
  if (!quota.allowed) return NextResponse.json({ error: "Mailbox quota exceeded" }, { status: 429 });

  const key = `${session.user.organizationId}/${mailbox._id}/${Date.now()}-${file.name}`;

  await uploadObject(key, bytes, file.type || "application/octet-stream");

  const attachment = await Attachment.create({
    organizationId: session.user.organizationId,
    uploadedBy: session.user.id,
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: bytes.length,
    storageKey: key,
    provider: "R2",
  });

  mailbox.storageUsedBytes = (mailbox.storageUsedBytes || 0) + bytes.length;
  mailbox.lastActivityAt = new Date();
  await mailbox.save();
  await Organization.findByIdAndUpdate(session.user.organizationId, { $inc: { storageUsedBytes: bytes.length } });

  return NextResponse.json(attachment, { status: 201 });
}
