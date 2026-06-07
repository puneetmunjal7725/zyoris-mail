"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { useSession } from "next-auth/react";

export default function AdminPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);

  useEffect(() => {
    if (session?.user?.role === "SUPER_ADMIN") {
      clientApi("/api/admin/stats").then(setStats).catch(() => setStats(null));
      clientApi<any[]>("/api/admin/organizations").then(setOrgs).catch(() => setOrgs([]));
    }
  }, [session?.user?.role]);

  if (session?.user?.role !== "SUPER_ADMIN") {
    return <Card>Super Admin access required.</Card>;
  }

  return (
    <div className="space-y-4 p-2">
      <Card>
        <h2 className="text-xl font-semibold">Platform dashboard</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Metric label="Users" value={stats?.users} />
          <Metric label="Organizations" value={stats?.organizations} />
          <Metric label="Domains" value={stats?.domains} />
          <Metric label="Emails" value={stats?.emails} />
          <Metric label="Mailboxes" value={stats?.mailboxes} />
          <Metric label="Active mailboxes" value={stats?.activeMailboxes} />
          <Metric label="Mailbox growth (7d)" value={stats?.mailboxGrowth7d} />
          <Metric label="Storage used" value={typeof stats?.storageUsedBytes === "number" ? stats.storageUsedBytes.toLocaleString() : undefined} />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold">Organizations & limits</h3>
        <div className="mt-3 space-y-2">
          {orgs.map((org) => (
            <div key={org._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm">
              <div>
                <div className="font-medium">{org.name}</div>
                <div className="text-xs text-[var(--muted)]">
                  Plan: {org.plan} · Users {org.usage?.users}/{org.userLimit < 0 ? "∞" : org.userLimit} · Mailboxes {org.usage?.mailboxes}/{org.mailboxLimit < 0 ? "∞" : org.mailboxLimit}
                </div>
              </div>
              <Button
                className="text-xs"
                onClick={async () => {
                  await clientApi("/api/admin/organizations", {
                    method: "PATCH",
                    body: JSON.stringify({
                      organizationId: org._id,
                      mailboxLimit: -1,
                      domainLimit: -1,
                      aliasLimit: -1,
                      userLimit: -1,
                      emailsPerDayLimit: -1,
                      storageLimitBytes: -1,
                      plan: "enterprise",
                    }),
                  });
                  const refreshed = await clientApi<any[]>("/api/admin/organizations");
                  setOrgs(refreshed);
                }}
              >
                Set unlimited
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value ?? "-"}</div>
    </div>
  );
}
