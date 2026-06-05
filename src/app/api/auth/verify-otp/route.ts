import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { verifyOtpSchema } from "@/lib/validators";
import { sha256 } from "@/lib/env";
import { User, OTP } from "@/models";

export async function POST(req: Request) {
  const parsed = verifyOtpSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const user = await User.findOne({ email: parsed.data.email });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const otp = await OTP.findOne({ userId: user._id, purpose: parsed.data.purpose, codeHash: sha256(parsed.data.code), usedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  if (!otp) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });

  otp.usedAt = new Date();
  await otp.save();

  if (parsed.data.purpose === "VERIFY_EMAIL") {
    user.isVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();
  }

  return NextResponse.json({ ok: true });
}
