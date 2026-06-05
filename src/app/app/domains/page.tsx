"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";

export default function DomainsPage() {
  const { data: session } = useSession();
  const [domains, setDomains] = useState<any[]>([]);
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [domain, setDomain] = useState("");
  const [catchAllMailboxId, setCatchAllMailboxId] = useState<Record<string, string>>({});
  const [catchAllEnabled, setCatchAllEnabled] = useState<Record<string, boolean>>({});

  async function refresh() {
    const rows = await clientApi<any[]>("/api/domains");
    setDomains(rows);
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

  return (
    <Card>
      <h2 className="text-xl font-semibold">Domains</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input placeholder="example.com" value={domain} onChange={(e) => setDomain(e.target.value)} className="max-w-sm" />
        <Button
          onClick={async () => {
            if (!session?.user?.organizationId) return;
            await clientApi("/api/domains", {
              method: "POST",
              body: JSON.stringify({ domain, organizationId: session.user.organizationId }),
            });
            setDomain("");
            await refresh();
          }}
        >
          Add domain
        </Button>
      </div>
      <div className="mt-6 space-y-3">
        {domains.map((d) => (
          <Card key={String(d._id)} className="border border-[var(--border)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{d.domain}</div>
                <div className="mt-1 text-xs text-[var(--muted)]">Status: {d.status}</div>
                <div className="mt-2 text-xs text-[var(--muted)]">TXT: zyoris-verification={d.verificationToken}</div>
              </div>
              <Button
                className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]"
                onClick={async () => {
                  await clientApi(`/api/domains/${String(d._id)}/verify`, { method: "POST" });
                  await refresh();
                }}
              >
                Verify DNS
              </Button>
            </div>
            <div className="mt-4 rounded-xl border border-[var(--border)] p-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="font-medium">Catch-all</div>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={Boolean(catchAllEnabled[String(d._id)])}
                    onChange={(e) => setCatchAllEnabled((p) => ({ ...p, [String(d._id)]: e.target.checked }))}
                  />
                  Enabled
                </label>
              </div>
              <div className="mt-2 flex gap-2">
                <select
                  className="h-10 flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3"
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
                        catchAllMailboxId: catchAllEnabled[String(d._id)] ? catchAllMailboxId[String(d._id)] || null : null,
                      }),
                    });
                    await refresh();
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
            <pre className="mt-4 overflow-auto rounded-xl bg-[#0B0D14] p-3 text-xs text-white">
              {JSON.stringify({ dnsStatus: d.dnsStatus, diagnostics: d.diagnostics }, null, 2)}
            </pre>
          </Card>
        ))}
      </div>
    </Card>
  );
}
