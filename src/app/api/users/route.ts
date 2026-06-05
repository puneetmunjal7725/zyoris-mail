import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { withApi } from "@/lib/api-error";
import { User } from "@/models";
import { z } from "zod";

const patchSchema = z.object({
  userId: z.string(),
  role: z.enum(["ORG_ADMIN", "USER"]).optional(),
});

export async function GET() {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
    await connectToDatabase();
    const filter =
      session.user.role === "SUPER_ADMIN" && !session.user.organizationId
        ? {}
        : { organizationId: session.user.organizationId };
    const users = await User.find(filter).select("-passwordHash").sort({ createdAt: -1 }).lean();
    return NextResponse.json(users);
  });
}

export async function PATCH(req: Request) {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
    const parsed = patchSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    await connectToDatabase();

    const user = await User.findOne({
      _id: parsed.data.userId,
      organizationId: session.user.organizationId,
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (parsed.data.role) user.role = parsed.data.role;
    await user.save();
    return NextResponse.json({ id: user._id, role: user.role, email: user.email, name: user.name });
  });
}
