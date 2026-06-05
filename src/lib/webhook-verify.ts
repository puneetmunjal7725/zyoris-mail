import crypto from "crypto";

export function verifyResendWebhook(rawBody: string, signature: string | null) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function verifyMailgunWebhook(timestamp: string, token: string, signature: string | null) {
  const secret = process.env.MAILGUN_WEBHOOK_SIGNING_KEY || process.env.MAILGUN_API_KEY;
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signature) return false;
  const encoded = crypto.createHmac("sha256", secret).update(`${timestamp}${token}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(encoded));
  } catch {
    return false;
  }
}
