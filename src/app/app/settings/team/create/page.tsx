"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";

export default function CreateTeamEmailPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<any[]>([]);
  const [domainId, setDomainId] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi<any[]>("/api/domains").then((rows) => {
      const verified = rows.filter((d) => d.status === "VERIFIED");
      setDomains(verified);
      if (verified[0]) setDomainId(String(verified[0]._id));
    });
  }, []);

  const selected = domains.find((d) => String(d._id) === domainId);
  const preview = selected && username ? `${username}@${selected.domain}` : "";

  return (
    <SettingsShell title="Add team email">
      <Card className="max-w-lg space-y-3">
        {domains.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">Connect a domain first in Settings → Domains.</p>
        ) : (
          <>
            <div>
              <label className="zyoris-label">Domain</label>
              <select className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm" value={domainId} onChange={(e) => setDomainId(e.target.value)}>
                {domains.map((d) => (
                  <option key={String(d._id)} value={String(d._id)}>{d.domain}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="zyoris-label">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="support" />
              {preview && <p className="mt-1 text-sm text-[var(--muted)]">{preview}</p>}
            </div>
            <div>
              <label className="zyoris-label">Display name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Support Team" />
            </div>
            {error && <div className="zyoris-error">{error}</div>}
            <Button
              onClick={async () => {
                try {
                  await clientApi("/api/mailboxes", {
                    method: "POST",
                    body: JSON.stringify({
                      domainId,
                      username,
                      displayName: displayName || username,
                      password: crypto.randomUUID() + "Aa1!",
                    }),
                  });
                  router.push("/app/settings/team");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to create");
                }
              }}
            >
              Create email
            </Button>
          </>
        )}
      </Card>
    </SettingsShell>
  );
}
