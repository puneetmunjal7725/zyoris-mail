import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validators";
import { sha256 } from "@/lib/env";
import { User, OTP } from "@/models";

export async function POST(req: Request) {
  const parsed = resetPasswordSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const otp = await OTP.findOne({ purpose: "RESET_PASSWORD", codeHash: sha256(parsed.data.token), usedAt: null, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
  if (!otp) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

  const user = await User.findById(otp.userId);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  user.passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await user.save();
  otp.usedAt = new Date();
  await otp.save();

  return NextResponse.json({ ok: true });
}
