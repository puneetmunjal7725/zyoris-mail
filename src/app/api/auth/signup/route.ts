import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import { sha256, randomToken, randomOtpCode } from "@/lib/env";
import { User, Organization, OTP, ActivityLog, Settings } from "@/models";
import { sendProviderEmail } from "@/lib/services/mailer";

export async function POST(req: Request) {
  const parsed = signupSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const exists = await User.findOne({ email: parsed.data.email });
  if (exists) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    role: "ORG_ADMIN",
    isVerified: false,
  });

  const slug = parsed.data.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const org = await Organization.create({ name: parsed.data.organizationName, slug, ownerId: user._id });
  user.organizationId = org._id;
  await user.save();
  await Settings.create({ organizationId: org._id });

  const otpCode = randomOtpCode();
  await OTP.create({ userId: user._id, purpose: "VERIFY_EMAIL", codeHash: sha256(otpCode), expiresAt: new Date(Date.now() + 10 * 60 * 1000) });

  await sendProviderEmail({
    to: [user.email],
    subject: "Verify your Zyoris Mail account",
    html: `<p>Your verification OTP is <b>${otpCode}</b></p>`,
    text: `Your verification OTP is ${otpCode}`,
  });

  await ActivityLog.create({ organizationId: org._id, userId: user._id, action: "SIGNUP", severity: "LOW" });

  return NextResponse.json({ id: String(user._id), organizationId: String(org._id) }, { status: 201 });
}
