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

  if (error) return <Card className="text-red-600">{error}</Card>;
  if (!data) return <Card>Loading billing…</Card>;

  const plans = Object.values(data.plans || {});

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-semibold">Billing & usage</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4 text-sm">
          <div className="rounded-xl border border-[var(--border)] p-3">Users: {data.usage.users} / {data.limits.userLimit}</div>
          <div className="rounded-xl border border-[var(--border)] p-3">Mailboxes: {data.usage.mailboxes} / {data.limits.mailboxLimit}</div>
          <div className="rounded-xl border border-[var(--border)] p-3">Emails today: {data.usage.emailsToday} / {data.limits.emailsPerDay}</div>
          <div className="rounded-xl border border-[var(--border)] p-3">Storage: {Number(data.usage.storageUsedBytes).toLocaleString()} bytes</div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan: any) => (
          <Card key={plan.id}>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <div className="mt-2 text-3xl font-bold">${plan.priceMonthly}<span className="text-sm font-normal text-[var(--muted)]">/mo</span></div>
            <ul className="mt-4 space-y-1 text-sm text-[var(--muted)]">
              <li>{plan.userLimit} users</li>
              <li>{plan.mailboxLimit} mailboxes</li>
              <li>{Math.round(plan.storageLimitBytes / 1024 / 1024 / 1024)} GB storage</li>
            </ul>
            <Button
              className="mt-4 w-full"
              disabled={data.currentPlan === plan.id}
              onClick={async () => {
                await clientApi("/api/billing", { method: "PATCH", body: JSON.stringify({ planId: plan.id }) });
                const refreshed = await clientApi("/api/billing");
                setData(refreshed);
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
