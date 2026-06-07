import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { emailSchema } from "@/lib/validators";
import { Email, EmailThread, ActivityLog, ScheduledEmail, Mailbox, Organization } from "@/models";
import { sendProviderEmail } from "@/lib/services/mailer";
import { getMailQueue } from "@/lib/queue/mail-queue";
import { estimateEmailBytes } from "@/lib/mailbox-routing";
import { assertCanSendEmail, recordOutboundEmail } from "@/lib/plan-limits";

export async function POST(req: Request) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN", "USER"]);
  const parsed = emailSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (!session.user.organizationId || !session.user.email) return NextResponse.json({ error: "Organization context missing" }, { status: 400 });

  await connectToDatabase();

  try {
    await assertCanSendEmail(String(session.user.organizationId));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Send limit exceeded" }, { status: 403 });
  }

  const mailbox = await Mailbox.findOne({ emailAddress: parsed.data.mailbox.toLowerCase(), organizationId: session.user.organizationId });
  if (!mailbox) return NextResponse.json({ error: "Mailbox not found" }, { status: 404 });
  if (!mailbox.isActive || mailbox.isSuspended) return NextResponse.json({ error: "Mailbox suspended" }, { status: 403 });

  const participants = Array.from(new Set([parsed.data.from, ...parsed.data.to, ...(parsed.data.cc || [])]));
  let threadId: mongoose.Types.ObjectId | undefined;

  if (parsed.data.replyToEmailId) {
    const parent = await Email.findById(parsed.data.replyToEmailId);
    threadId = parent?.threadId ? new mongoose.Types.ObjectId(String(parent.threadId)) : undefined;
  }
  if (!threadId) {
    const thread = await EmailThread.create({ organizationId: session.user.organizationId, subject: parsed.data.subject, participants, lastMessageAt: new Date() });
    threadId = thread._id;
  }

  const email = await Email.create({
    organizationId: session.user.organizationId,
    mailbox: parsed.data.mailbox,
    from: parsed.data.from || session.user.email,
    to: parsed.data.to,
    cc: parsed.data.cc || [],
    bcc: parsed.data.bcc || [],
    subject: parsed.data.subject,
    bodyHtml: parsed.data.bodyHtml,
    bodyText: parsed.data.bodyText,
    threadId,
    labels: parsed.data.labels || [],
    attachments: (parsed.data.attachments || []).map((id) => new mongoose.Types.ObjectId(id)),
    inReplyToEmailId: parsed.data.replyToEmailId,
    folder: parsed.data.sendAt ? "DRAFT" : "SENT",
    scheduledAt: parsed.data.sendAt ? new Date(parsed.data.sendAt) : undefined,
    sentAt: parsed.data.sendAt ? undefined : new Date(),
    isRead: true,
  });

  const outgoingBytes = estimateEmailBytes({ subject: parsed.data.subject, bodyText: parsed.data.bodyText, bodyHtml: parsed.data.bodyHtml });

  if (parsed.data.sendAt) {
    const scheduled = await ScheduledEmail.create({
      emailId: email._id,
      organizationId: session.user.organizationId,
      scheduledFor: new Date(parsed.data.sendAt),
      status: "QUEUED",
    });
    await getMailQueue().add("send-scheduled-email", { scheduledEmailId: String(scheduled._id) }, { delay: Math.max(0, new Date(parsed.data.sendAt).getTime() - Date.now()) });
  } else {
    const providerMessageId = await sendProviderEmail({
      from: parsed.data.from || session.user.email,
      to: parsed.data.to,
      cc: parsed.data.cc,
      bcc: parsed.data.bcc,
      subject: parsed.data.subject,
      html: parsed.data.bodyHtml,
      text: parsed.data.bodyText,
    });
    email.providerMessageId = providerMessageId;
    await email.save();
  }

  await Mailbox.updateOne(
    { _id: mailbox._id },
    { $inc: { sentCount: 1, storageUsedBytes: outgoingBytes }, $set: { lastActivityAt: new Date() } }
  );
  await recordOutboundEmail(String(session.user.organizationId), outgoingBytes);

  await ActivityLog.create({ organizationId: session.user.organizationId, userId: session.user.id, action: "EMAIL_CREATED", metadata: { emailId: email._id } });

  return NextResponse.json(email, { status: 201 });
}
