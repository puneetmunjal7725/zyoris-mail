"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";
import { useToast } from "@/components/ui/toast-provider";

export default function CreateTeamEmailPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [domains, setDomains] = useState<any[]>([]);
  const [domainId, setDomainId] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDomains, setLoadingDomains] = useState(true);

  useEffect(() => {
    clientApi<any[]>("/api/domains")
      .then((rows) => {
        const verified = rows.filter((d) => d.status === "VERIFIED");
        setDomains(verified);
        if (verified[0]) setDomainId(String(verified[0]._id));
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Failed to load domains", "error"))
      .finally(() => setLoadingDomains(false));
  }, [toast]);

  const selected = domains.find((d) => String(d._id) === domainId);
  const preview = selected && username ? `${username}@${selected.domain}` : "";

  async function createEmail() {
    if (!domainId) {
      toast("Select a domain first", "error");
      return;
    }
    if (!username.trim()) {
      toast("Enter a username", "error");
      return;
    }
    setLoading(true);
    try {
      const created = await clientApi<any>("/api/mailboxes", {
        method: "POST",
        body: JSON.stringify({
          domainId,
          username: username.trim(),
          displayName: displayName.trim() || username.trim(),
          password: crypto.randomUUID() + "Aa1!",
        }),
      });
      toast(`Team email created: ${created.emailAddress}`, "success");
      router.push("/app/settings/team");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to create team email", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SettingsShell title="Add team email">
      <Card className="max-w-lg space-y-3">
        {loadingDomains ? (
          <p className="text-sm text-[var(--muted)]">Loading domains…</p>
        ) : domains.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No verified domain found. Connect and verify a domain in Settings → Domains first.</p>
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
              {preview && <p className="mt-1 text-sm font-medium">{preview}</p>}
            </div>
            <div>
              <label className="zyoris-label">Display name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Support Team" />
            </div>
            <Button onClick={createEmail} disabled={loading}>
              {loading ? "Creating…" : "Create email"}
            </Button>
          </>
        )}
      </Card>
    </SettingsShell>
  );
}
