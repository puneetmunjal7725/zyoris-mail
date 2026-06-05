"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { clientApi } from "@/lib/client-api";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    clientApi("/api/admin/stats").then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <Card>
      <h2 className="text-xl font-semibold">Admin dashboard</h2>
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
  );
}

function Metric({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <div className="text-xs text-[var(--muted)]">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value ?? "-"}</div>
    </div>
  );
}
