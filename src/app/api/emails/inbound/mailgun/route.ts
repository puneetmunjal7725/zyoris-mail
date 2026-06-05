import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { inboundMailgunSchema } from "@/lib/validators";
import { Email, EmailThread, Mailbox, Organization } from "@/models";
import { checkMailboxQuota, estimateEmailBytes, resolveInboundRecipient } from "@/lib/mailbox-routing";
import { verifyMailgunWebhook } from "@/lib/webhook-verify";

export async function POST(req: Request) {
  const form = await req.formData();
  const timestamp = String(form.get("timestamp") || "");
  const token = String(form.get("token") || "");
  const signature = String(form.get("signature") || "");

  if (!verifyMailgunWebhook(timestamp, token, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const parsed = inboundMailgunSchema.safeParse({
    sender: form.get("sender"),
    recipient: form.get("recipient"),
    subject: form.get("subject") || "",
    bodyPlain: form.get("body-plain") || "",
    bodyHtml: form.get("body-html") || "",
    messageId: form.get("Message-Id") || undefined,
  });

  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await connectToDatabase();

  const resolved = await resolveInboundRecipient(parsed.data.recipient);
  if (!resolved.ok) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  const incomingBytes = estimateEmailBytes({
    subject: parsed.data.subject,
    bodyText: parsed.data.bodyPlain || parsed.data.bodyHtml,
    bodyHtml: parsed.data.bodyHtml || parsed.data.bodyPlain,
  });

  const quota = checkMailboxQuota(resolved.mailbox, incomingBytes);
  if (!quota.allowed) return NextResponse.json({ error: "Mailbox quota exceeded" }, { status: 429 });

  const thread = await EmailThread.create({
    organizationId: resolved.mailbox.organizationId,
    subject: parsed.data.subject,
    participants: [parsed.data.sender, resolved.address],
    lastMessageAt: new Date(),
  });
  const email = await Email.create({
    organizationId: resolved.mailbox.organizationId,
    mailbox: resolved.address,
    from: parsed.data.sender,
    to: [resolved.address],
    subject: parsed.data.subject,
    bodyHtml: parsed.data.bodyHtml || parsed.data.bodyPlain,
    bodyText: parsed.data.bodyPlain || parsed.data.bodyHtml,
    folder: "INBOX",
    threadId: thread._id,
    receivedAt: new Date(),
    providerMessageId: parsed.data.messageId,
  });

  await Mailbox.updateOne(
    { _id: resolved.mailbox._id },
    { $inc: { receivedCount: 1, storageUsedBytes: incomingBytes }, $set: { lastActivityAt: new Date() } }
  );
  await Organization.updateOne({ _id: resolved.mailbox.organizationId }, { $inc: { storageUsedBytes: incomingBytes } });

  return NextResponse.json({ ok: true, emailId: email._id });
}
