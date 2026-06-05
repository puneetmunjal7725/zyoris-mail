export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    userLimit: 5,
    mailboxLimit: 3,
    storageLimitBytes: 2 * 1024 * 1024 * 1024,
    emailsPerDay: 100,
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 29,
    userLimit: 25,
    mailboxLimit: 50,
    storageLimitBytes: 50 * 1024 * 1024 * 1024,
    emailsPerDay: 5000,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 99,
    userLimit: 500,
    mailboxLimit: 500,
    storageLimitBytes: 500 * 1024 * 1024 * 1024,
    emailsPerDay: 50000,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanLimits(planId: string) {
  return PLANS[(planId as PlanId) || "free"] || PLANS.free;
}
