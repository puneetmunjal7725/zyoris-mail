import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { sendProviderEmail } from "@/lib/services/mailer";
import { getMailEnv } from "@/lib/env";

const testSendSchema = z.object({
  to: z.string().email().optional(),
});

export async function POST(req: Request) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const parsed = testSendSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  await connectToDatabase();

  const env = getMailEnv();
  if (!env.RESEND_API_KEY && env.EMAIL_PROVIDER === "RESEND") {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured" }, { status: 503 });
  }

  const to = parsed.data.to || session.user.email;
  if (!to) return NextResponse.json({ error: "No recipient email" }, { status: 400 });

  try {
    const messageId = await sendProviderEmail({
      from: env.FROM_EMAIL,
      to: [to],
      subject: "Zyoris Mail delivery test",
      html: "<p>If you received this, outbound email delivery is working.</p>",
      text: "If you received this, outbound email delivery is working.",
    });
    return NextResponse.json({ ok: true, messageId, to, from: env.FROM_EMAIL });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
