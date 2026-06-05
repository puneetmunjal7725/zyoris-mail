"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { clientApi } from "@/lib/client-api";

export default function AdminMonitoringPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    clientApi("/api/admin/monitoring").then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <Card>Loading monitoring…</Card>;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-semibold">Security monitoring</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] p-4">Users: {data.users}</div>
          <div className="rounded-xl border border-[var(--border)] p-4">Organizations: {data.organizations}</div>
          <div className="rounded-xl border border-[var(--border)] p-4">Emails: {data.emails}</div>
          <div className="rounded-xl border border-[var(--border)] p-4">Verified domains: {data.verifiedDomains}</div>
          <div className="rounded-xl border border-[var(--border)] p-4">Failed domains: {data.failedDomains}</div>
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold">Recent high-severity events</h3>
        <pre className="mt-3 overflow-auto text-xs">{JSON.stringify(data.recentSecurityEvents, null, 2)}</pre>
      </Card>
    </div>
  );
}
