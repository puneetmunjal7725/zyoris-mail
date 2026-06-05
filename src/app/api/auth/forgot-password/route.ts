import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators";
import { randomToken, sha256 } from "@/lib/env";
import { User, OTP } from "@/models";
import { sendProviderEmail } from "@/lib/services/mailer";

export async function POST(req: Request) {
  const parsed = forgotPasswordSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const user = await User.findOne({ email: parsed.data.email });
  if (!user) return NextResponse.json({ ok: true });

  const resetToken = randomToken(24);
  const codeHash = sha256(resetToken);

  await OTP.create({ userId: user._id, purpose: "RESET_PASSWORD", codeHash, expiresAt: new Date(Date.now() + 20 * 60 * 1000) });

  await sendProviderEmail({
    to: [user.email],
    subject: "Reset your password",
    html: `<p>Reset token: <b>${resetToken}</b></p>`,
    text: `Reset token: ${resetToken}`,
  });

  return NextResponse.json({ ok: true });
}
