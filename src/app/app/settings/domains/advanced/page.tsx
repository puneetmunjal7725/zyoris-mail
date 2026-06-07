"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";

export default function AdvancedDnsPage() {
  const { data: session } = useSession();
  const [domains, setDomains] = useState<any[]>([]);
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [catchAllMailboxId, setCatchAllMailboxId] = useState<Record<string, string>>({});
  const [catchAllEnabled, setCatchAllEnabled] = useState<Record<string, boolean>>({});

  async function refresh() {
    const rows = await clientApi<any[]>("/api/domains");
    setDomains(rows.filter((d) => d.domain !== "zyoris.com"));
    const enabledMap: Record<string, boolean> = {};
    const mailboxMap: Record<string, string> = {};
    rows.forEach((d) => {
      enabledMap[String(d._id)] = Boolean(d.catchAllEnabled);
      mailboxMap[String(d._id)] = d.catchAllMailboxId ? String(d.catchAllMailboxId) : "";
    });
    setCatchAllEnabled(enabledMap);
    setCatchAllMailboxId(mailboxMap);
    setMailboxes(await clientApi("/api/mailboxes"));
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  if (domains.length === 0) {
    return (
      <SettingsShell title="Advanced DNS">
        <Card>
          <p className="text-sm text-[var(--muted)]">Add a custom domain first to see DNS records here.</p>
        </Card>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title="Advanced DNS">
      <p className="mb-4 text-sm text-[var(--muted)]">For IT administrators. Add these records at your domain registrar.</p>
      <div className="space-y-4">
        {domains.map((d) => (
          <Card key={String(d._id)}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{d.domain}</div>
                <div className="text-xs text-[var(--muted)]">Status: {d.status}</div>
              </div>
              <Button
                className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]"
                onClick={async () => {
                  await clientApi(`/api/domains/${String(d._id)}/verify`, { method: "POST" });
                  await refresh();
                }}
              >
                Check DNS
              </Button>
            </div>

            <div className="mt-4 space-y-2 rounded-lg bg-[var(--secondary)] p-3 text-xs font-mono">
              <div>TXT verification: zyoris-verification={d.verificationToken}</div>
              {d.diagnostics?.spf && <div>SPF: {d.diagnostics.spf}</div>}
              {d.diagnostics?.dkim && <div>DKIM: {d.diagnostics.dkim}</div>}
              {d.diagnostics?.dmarc && <div>DMARC: {d.diagnostics.dmarc}</div>}
              {d.diagnostics?.mx && <div>MX: {d.diagnostics.mx}</div>}
            </div>

            <div className="mt-4 rounded-lg border border-[var(--border)] p-3 text-sm">
              <div className="font-medium">Catch-all</div>
              <div className="mt-2 flex gap-2">
                <select
                  className="h-9 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 text-sm"
                  value={catchAllMailboxId[String(d._id)] || ""}
                  onChange={(e) => setCatchAllMailboxId((p) => ({ ...p, [String(d._id)]: e.target.value }))}
                >
                  <option value="">Select mailbox</option>
                  {mailboxes
                    .filter((m) => String(m.domainId) === String(d._id))
                    .map((m) => (
                      <option key={String(m._id)} value={String(m._id)}>
                        {m.emailAddress}
                      </option>
                    ))}
                </select>
                <Button
                  onClick={async () => {
                    await clientApi(`/api/domains/${String(d._id)}/catchall`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        catchAllEnabled: Boolean(catchAllEnabled[String(d._id)]),
                        catchAllMailboxId: catchAllMailboxId[String(d._id)] || null,
                      }),
                    });
                    await refresh();
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SettingsShell>
  );
}
