import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { orgSchema } from "@/lib/validators";
import { Organization, User, ActivityLog } from "@/models";

export async function GET() {
  const session = await requireSession();
  await connectToDatabase();

  if (session.user.role === "SUPER_ADMIN") {
    const rows = await Organization.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(rows);
  }

  const row = await Organization.findById(session.user.organizationId).lean();
  return NextResponse.json(row ? [row] : []);
}

export async function POST(req: Request) {
  const session = await requireSession();
  const parsed = orgSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const slug = parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const org = await Organization.create({ ...parsed.data, slug, ownerId: session.user.id });

  await User.findByIdAndUpdate(session.user.id, { organizationId: org._id, role: "ORG_ADMIN" });
  await ActivityLog.create({ organizationId: org._id, userId: session.user.id, action: "ORG_CREATED" });

  return NextResponse.json(org, { status: 201 });
}

export async function PATCH(req: Request) {
  const session = await requireSession();
  if (!session.user.organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });
  const parsed = orgSchema.partial().safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await connectToDatabase();
  const org = await Organization.findByIdAndUpdate(session.user.organizationId, parsed.data, { new: true });
  await ActivityLog.create({ organizationId: session.user.organizationId, userId: session.user.id, action: "ORG_UPDATED" });
  return NextResponse.json(org);
}

export async function DELETE() {
  const session = await requireSession();
  if (session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!session.user.organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  await connectToDatabase();
  await Organization.findByIdAndDelete(session.user.organizationId);
  await User.updateMany({ organizationId: session.user.organizationId }, { $set: { organizationId: null, role: "USER" } });
  return NextResponse.json({ ok: true });
}
