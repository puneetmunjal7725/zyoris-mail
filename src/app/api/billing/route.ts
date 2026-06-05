import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { withApi } from "@/lib/api-error";
import { Organization, Mailbox, User, Email } from "@/models";
import { PLANS, getPlanLimits } from "@/lib/plans";
import { z } from "zod";

const upgradeSchema = z.object({ planId: z.enum(["free", "growth", "enterprise"]) });

export async function GET() {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
    if (!session.user.organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });
    await connectToDatabase();

    const org = await Organization.findById(session.user.organizationId).lean();
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const plan = getPlanLimits(org.plan || "free");
    const [users, mailboxes, emailsToday] = await Promise.all([
      User.countDocuments({ organizationId: org._id }),
      Mailbox.countDocuments({ organizationId: org._id }),
      Email.countDocuments({
        organizationId: org._id,
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    return NextResponse.json({
      plans: PLANS,
      currentPlan: org.plan || "free",
      usage: {
        users,
        mailboxes,
        storageUsedBytes: org.storageUsedBytes,
        emailsToday,
      },
      limits: plan,
    });
  });
}

export async function PATCH(req: Request) {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
    const parsed = upgradeSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    if (!session.user.organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

    await connectToDatabase();
    const limits = getPlanLimits(parsed.data.planId);
    const org = await Organization.findByIdAndUpdate(
      session.user.organizationId,
      {
        plan: parsed.data.planId,
        userLimit: limits.userLimit,
        mailboxLimit: limits.mailboxLimit,
        storageLimitBytes: limits.storageLimitBytes,
      },
      { new: true }
    );
    return NextResponse.json(org);
  });
}
