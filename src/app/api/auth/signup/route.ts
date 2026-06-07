import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { signupSchema } from "@/lib/validators";
import { sha256, randomOtpCode } from "@/lib/env";
import { User, Organization, OTP, ActivityLog, Settings } from "@/models";
import { sendProviderEmail } from "@/lib/services/mailer";
import { applyPlanToOrgFields } from "@/lib/plan-limits";
import { createZyorisMailbox } from "@/lib/zyoris-mailbox";

export async function POST(req: Request) {
  try {
    const parsed = signupSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await connectToDatabase();
    const exists = await User.findOne({ email: parsed.data.email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

    const isZyoris = parsed.data.emailType === "zyoris";
    const orgName = parsed.data.organizationName || `${parsed.data.name}'s Mail`;

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      passwordHash,
      role: "ORG_ADMIN",
      isVerified: isZyoris,
    });

    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);
    const org = await Organization.create({
      name: orgName,
      slug,
      ownerId: user._id,
      ...applyPlanToOrgFields("free"),
    });
    user.organizationId = org._id;
    await user.save();
    await Settings.create({ organizationId: org._id });

    let mailboxAddress: string | undefined;

    if (isZyoris && parsed.data.zyorisUsername) {
      const mailbox = await createZyorisMailbox(org._id, parsed.data.zyorisUsername, parsed.data.name);
      mailboxAddress = mailbox.emailAddress;
      await ActivityLog.create({
        organizationId: org._id,
        userId: user._id,
        action: "ZYORIS_MAILBOX_CREATED",
        metadata: { emailAddress: mailboxAddress },
      });

      return NextResponse.json(
        {
          id: String(user._id),
          organizationId: String(org._id),
          emailType: "zyoris",
          mailboxAddress,
          readyForInbox: true,
          message: "Your Zyoris email is ready.",
        },
        { status: 201 }
      );
    }

    const otpCode = randomOtpCode();
    await OTP.create({
      userId: user._id,
      purpose: "VERIFY_EMAIL",
      codeHash: sha256(otpCode),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    let emailSent = false;
    try {
      await sendProviderEmail({
        to: [user.email],
        subject: "Verify your Zyoris Mail account",
        html: `<p>Your verification OTP is <b>${otpCode}</b></p><p>This code expires in 10 minutes.</p>`,
        text: `Your verification OTP is ${otpCode}`,
      });
      emailSent = true;
    } catch (mailErr) {
      console.error("Signup verification email failed:", mailErr);
    }

    await ActivityLog.create({ organizationId: org._id, userId: user._id, action: "SIGNUP", severity: "LOW" });

    return NextResponse.json(
      {
        id: String(user._id),
        organizationId: String(org._id),
        emailType: "custom",
        emailSent,
        requiresVerification: true,
        verificationOtp: emailSent ? undefined : otpCode,
        message: emailSent
          ? "Account created. Check your email for the verification code."
          : "Account created. Use the verification code on the next screen.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Signup failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Signup failed. Check database connection." },
      { status: 500 }
    );
  }
}
