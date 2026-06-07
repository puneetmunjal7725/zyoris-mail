import { connectToDatabase } from "@/lib/db";
import { Organization } from "@/models";
import { getPlanLimits } from "@/lib/plans";

export function isUnlimited(limit: number | null | undefined) {
  return limit == null || limit < 0;
}

export function isWithinLimit(current: number, limit: number | null | undefined) {
  if (isUnlimited(limit)) return true;
  return current < (limit as number);
}

export function formatLimit(limit: number | null | undefined) {
  return isUnlimited(limit) ? "Unlimited" : String(limit);
}

export function applyPlanToOrgFields(planId: string) {
  const plan = getPlanLimits(planId);
  return {
    plan: planId,
    userLimit: plan.userLimit,
    mailboxLimit: plan.mailboxLimit,
    domainLimit: plan.domainLimit,
    aliasLimit: plan.aliasLimit,
    storageLimitBytes: plan.storageLimitBytes,
    emailsPerDayLimit: plan.emailsPerDay,
  };
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function assertCanSendEmail(organizationId: string) {
  await connectToDatabase();
  const org = await Organization.findById(organizationId);
  if (!org || org.isActive === false) throw new Error("Organization not active");

  const today = startOfToday();
  if (!org.emailsSentOn || org.emailsSentOn < today) {
    org.emailsSentToday = 0;
    org.emailsSentOn = today;
    await org.save();
  }

  if (!isWithinLimit(org.emailsSentToday, org.emailsPerDayLimit)) {
    throw new Error("Daily outbound email limit exceeded");
  }

  if (!isUnlimited(org.storageLimitBytes) && org.storageUsedBytes >= org.storageLimitBytes) {
    throw new Error("Organization storage limit exceeded");
  }
}

export async function recordOutboundEmail(organizationId: string, bytes: number) {
  await connectToDatabase();
  const today = startOfToday();
  await Organization.updateOne(
    { _id: organizationId },
    {
      $inc: { emailsSentToday: 1, storageUsedBytes: bytes },
      $set: { emailsSentOn: today },
    }
  );
}
