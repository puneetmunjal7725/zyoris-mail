import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { inboundResendSchema } from "@/lib/validators";
import { Email, EmailThread, Mailbox, Organization } from "@/models";
import { checkMailboxQuota, estimateEmailBytes, resolveInboundRecipient } from "@/lib/mailbox-routing";
import { verifyResendWebhook } from "@/lib/webhook-verify";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("resend-signature") || req.headers.get("x-resend-signature");
  if (!verifyResendWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  const parsed = inboundResendSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await connectToDatabase();

  const recipient = parsed.data.to[0];
  const resolved = await resolveInboundRecipient(recipient);
  if (!resolved.ok) return NextResponse.json({ error: resolved.error }, { status: resolved.status });

  const incomingBytes = estimateEmailBytes({
    subject: parsed.data.subject,
    bodyText: parsed.data.text || parsed.data.html,
    bodyHtml: parsed.data.html || parsed.data.text,
  });
  const quota = checkMailboxQuota(resolved.mailbox, incomingBytes);
  if (!quota.allowed) return NextResponse.json({ error: "Mailbox quota exceeded" }, { status: 429 });

  const thread = await EmailThread.create({
    organizationId: resolved.mailbox.organizationId,
    subject: parsed.data.subject,
    participants: [parsed.data.from, resolved.address],
    lastMessageAt: new Date(),
  });
  const email = await Email.create({
    organizationId: resolved.mailbox.organizationId,
    mailbox: resolved.address,
    from: parsed.data.from,
    to: [resolved.address],
    subject: parsed.data.subject,
    bodyHtml: parsed.data.html || parsed.data.text,
    bodyText: parsed.data.text || parsed.data.html,
    folder: "INBOX",
    threadId: thread._id,
    receivedAt: new Date(),
    providerMessageId: parsed.data.headers?.["message-id"],
  });

  await Mailbox.updateOne(
    { _id: resolved.mailbox._id },
    { $inc: { receivedCount: 1, storageUsedBytes: incomingBytes }, $set: { lastActivityAt: new Date() } }
  );
  await Organization.updateOne({ _id: resolved.mailbox.organizationId }, { $inc: { storageUsedBytes: incomingBytes } });

  return NextResponse.json({ ok: true, emailId: email._id });
}
