import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { acceptInviteSchema } from "@/lib/validators";
import { sha256 } from "@/lib/env";
import { Invitation, User } from "@/models";

export async function POST(req: Request) {
  const parsed = acceptInviteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const invitation = await Invitation.findOne({ tokenHash: sha256(parsed.data.token), acceptedAt: null, expiresAt: { $gt: new Date() } });
  if (!invitation) return NextResponse.json({ error: "Invalid invitation" }, { status: 400 });

  let user = await User.findOne({ email: invitation.email });
  if (!user) {
    user = await User.create({
      name: parsed.data.name,
      email: invitation.email,
      passwordHash: await bcrypt.hash(parsed.data.password, 12),
      role: invitation.role,
      organizationId: invitation.organizationId,
      isVerified: true,
      emailVerifiedAt: new Date(),
    });
  } else {
    user.organizationId = invitation.organizationId;
    user.role = invitation.role;
    await user.save();
  }

  invitation.acceptedAt = new Date();
  await invitation.save();

  return NextResponse.json({ ok: true });
}
