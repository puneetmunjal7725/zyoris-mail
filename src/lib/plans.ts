export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    userLimit: 5,
    mailboxLimit: 10,
    domainLimit: 1,
    aliasLimit: 5,
    storageLimitBytes: 2 * 1024 * 1024 * 1024,
    emailsPerDay: 100,
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 29,
    userLimit: 25,
    mailboxLimit: 50,
    domainLimit: 5,
    aliasLimit: 25,
    storageLimitBytes: 50 * 1024 * 1024 * 1024,
    emailsPerDay: 5000,
  },
  business: {
    id: "business",
    name: "Business",
    priceMonthly: 59,
    userLimit: 100,
    mailboxLimit: 200,
    domainLimit: 20,
    aliasLimit: 100,
    storageLimitBytes: 200 * 1024 * 1024 * 1024,
    emailsPerDay: 20000,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 99,
    userLimit: -1,
    mailboxLimit: -1,
    domainLimit: -1,
    aliasLimit: -1,
    storageLimitBytes: -1,
    emailsPerDay: -1,
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanLimits(planId: string) {
  return PLANS[(planId as PlanId) || "free"] || PLANS.free;
}
