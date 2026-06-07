import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { withApi } from "@/lib/api-error";
import { Organization, Mailbox, User, Email, Domain, Alias } from "@/models";
import { PLANS, getPlanLimits } from "@/lib/plans";
import { applyPlanToOrgFields, formatLimit } from "@/lib/plan-limits";
import { z } from "zod";

const upgradeSchema = z.object({ planId: z.enum(["free", "growth", "business", "enterprise"]) });

export async function GET() {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
    if (!session.user.organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });
    await connectToDatabase();

    const org = await Organization.findById(session.user.organizationId).lean();
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const plan = getPlanLimits(org.plan || "free");
    const mailboxIds = await Mailbox.find({ organizationId: org._id }).select({ _id: 1 }).lean();
    const [users, mailboxes, domains, aliases, emailsToday] = await Promise.all([
      User.countDocuments({ organizationId: org._id }),
      Mailbox.countDocuments({ organizationId: org._id }),
      Domain.countDocuments({ organizationId: org._id }),
      Alias.countDocuments({ mailboxId: { $in: mailboxIds.map((m) => m._id) } }),
      Email.countDocuments({
        organizationId: org._id,
        folder: "SENT",
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
    ]);

    return NextResponse.json({
      plans: PLANS,
      currentPlan: org.plan || "free",
      usage: { users, mailboxes, domains, aliases, storageUsedBytes: org.storageUsedBytes, emailsToday },
      limits: {
        ...plan,
        userLimit: org.userLimit,
        mailboxLimit: org.mailboxLimit,
        domainLimit: org.domainLimit,
        aliasLimit: org.aliasLimit,
        storageLimitBytes: org.storageLimitBytes,
        emailsPerDay: org.emailsPerDayLimit,
      },
      formattedLimits: {
        users: formatLimit(org.userLimit),
        mailboxes: formatLimit(org.mailboxLimit),
        domains: formatLimit(org.domainLimit),
        aliases: formatLimit(org.aliasLimit),
        storage: formatLimit(org.storageLimitBytes),
        emailsPerDay: formatLimit(org.emailsPerDayLimit),
      },
    });
  });
}

export async function PATCH(req: Request) {
  return withApi(async () => {
    const session = await requireRole(["SUPER_ADMIN", "ORG_ADMIN"]);
    const parsed = upgradeSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    if (!session.user.organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });
    if (parsed.data.planId === "enterprise" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Enterprise plan requires Super Admin" }, { status: 403 });
    }

    await connectToDatabase();
    const org = await Organization.findByIdAndUpdate(
      session.user.organizationId,
      applyPlanToOrgFields(parsed.data.planId),
      { new: true }
    );
    return NextResponse.json(org);
  });
}
