import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { inviteSchema } from "@/lib/validators";
import { randomToken, sha256 } from "@/lib/env";
import { Invitation, User, Organization, ActivityLog } from "@/models";
import { sendProviderEmail } from "@/lib/services/mailer";

export async function POST(req: Request) {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  const parsed = inviteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const org = await Organization.findById(parsed.data.organizationId);
  if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

  const currentUsers = await User.countDocuments({ organizationId: org._id });
  if (currentUsers >= org.userLimit) return NextResponse.json({ error: "User limit reached" }, { status: 400 });

  const token = randomToken(24);
  const invitation = await Invitation.create({
    organizationId: org._id,
    email: parsed.data.email,
    role: parsed.data.role,
    tokenHash: sha256(token),
    invitedBy: session.user.id,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  });

  await sendProviderEmail({
    to: [parsed.data.email],
    subject: `Invitation to ${org.name}`,
    html: `<p>You have been invited to join ${org.name}. Invitation token: <b>${token}</b></p>`,
    text: `You have been invited to join ${org.name}. Invitation token: ${token}`,
  });

  await ActivityLog.create({ organizationId: org._id, userId: session.user.id, action: "INVITE_CREATED", metadata: { invitationId: invitation._id } });

  return NextResponse.json({ ok: true, invitationId: invitation._id });
}

export async function GET() {
  const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
  await connectToDatabase();
  const rows = await Invitation.find({ organizationId: session.user.organizationId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(rows);
}
