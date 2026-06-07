"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi("/api/billing")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load billing"));
  }, []);

  if (error) return <Card className="p-4 text-red-600">{error}</Card>;
  if (!data) return <Card className="p-4">Loading billing…</Card>;

  const plans = Object.values(data.plans || {});

  return (
    <div className="space-y-4 p-2">
      <Card>
        <h2 className="text-xl font-semibold">Billing & usage</h2>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3 lg:grid-cols-6">
          <Usage label="Users" current={data.usage.users} limit={data.formattedLimits?.users} />
          <Usage label="Mailboxes" current={data.usage.mailboxes} limit={data.formattedLimits?.mailboxes} />
          <Usage label="Domains" current={data.usage.domains} limit={data.formattedLimits?.domains} />
          <Usage label="Aliases" current={data.usage.aliases} limit={data.formattedLimits?.aliases} />
          <Usage label="Emails today" current={data.usage.emailsToday} limit={data.formattedLimits?.emailsPerDay} />
          <Usage label="Storage" current={`${Number(data.usage.storageUsedBytes).toLocaleString()} B`} limit={data.formattedLimits?.storage} />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan: any) => (
          <Card key={plan.id}>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="mt-2 text-3xl font-bold">
              ${plan.priceMonthly}
              <span className="text-sm font-normal text-[var(--muted)]">/mo</span>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-[var(--muted)]">
              <li>{plan.userLimit < 0 ? "Unlimited" : plan.userLimit} users</li>
              <li>{plan.mailboxLimit < 0 ? "Unlimited" : plan.mailboxLimit} mailboxes</li>
              <li>{plan.domainLimit < 0 ? "Unlimited" : plan.domainLimit} domains</li>
              <li>{plan.aliasLimit < 0 ? "Unlimited" : plan.aliasLimit} aliases</li>
            </ul>
            <Button
              className="mt-4 w-full"
              disabled={data.currentPlan === plan.id}
              onClick={async () => {
                await clientApi("/api/billing", { method: "PATCH", body: JSON.stringify({ planId: plan.id }) });
                setData(await clientApi("/api/billing"));
              }}
            >
              {data.currentPlan === plan.id ? "Current plan" : "Select plan"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Usage({ label, current, limit }: { label: string; current: string | number; limit: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="mt-1 font-medium">
        {current} / {limit}
      </div>
    </div>
  );
}
