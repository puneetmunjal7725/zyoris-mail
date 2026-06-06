import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { sendOtpSchema } from "@/lib/validators";
import { User, OTP } from "@/models";
import { randomOtpCode, sha256 } from "@/lib/env";
import { sendProviderEmail } from "@/lib/services/mailer";

export async function POST(req: Request) {
  try {
    const parsed = sendOtpSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const code = randomOtpCode();
    await OTP.create({
      userId: user._id,
      purpose: parsed.data.purpose,
      codeHash: sha256(code),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    let emailSent = false;
    try {
      await sendProviderEmail({
        to: [user.email],
        subject: `Your Zyoris Mail verification code`,
        html: `<p>Your OTP is <b>${code}</b></p>`,
        text: `Your OTP is ${code}`,
      });
      emailSent = true;
    } catch (mailErr) {
      console.error("OTP email failed:", mailErr);
    }

    return NextResponse.json({
      ok: true,
      emailSent,
      verificationOtp: emailSent ? undefined : code,
    });
  } catch (err) {
    console.error("Send OTP failed:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to send OTP" }, { status: 500 });
  }
}
