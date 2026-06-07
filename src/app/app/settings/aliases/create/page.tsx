"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";

export default function CreateAliasPage() {
  const router = useRouter();
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [mailboxId, setMailboxId] = useState("");
  const [sourceAddress, setSourceAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi<any[]>("/api/mailboxes").then(setMailboxes).catch(() => setMailboxes([]));
  }, []);

  return (
    <SettingsShell title="Add alias">
      <Card className="max-w-lg space-y-3">
        <p className="text-sm text-[var(--muted)]">Forward incoming mail from one address to another.</p>
        <div>
          <label className="zyoris-label">Mailbox</label>
          <select
            className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
            value={mailboxId}
            onChange={(e) => setMailboxId(e.target.value)}
          >
            <option value="">Select mailbox</option>
            {mailboxes.map((m) => (
              <option key={String(m._id)} value={String(m._id)}>
                {m.emailAddress}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="zyoris-label">Alias address</label>
          <Input placeholder="support@yourdomain.com" value={sourceAddress} onChange={(e) => setSourceAddress(e.target.value)} />
        </div>
        <div>
          <label className="zyoris-label">Forward to</label>
          <Input placeholder="you@yourdomain.com" value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} />
        </div>
        {error && <div className="zyoris-error">{error}</div>}
        <Button
          onClick={async () => {
            try {
              const alias = await clientApi<any>("/api/aliases", {
                method: "POST",
                body: JSON.stringify({ mailboxId, sourceAddress, destinationAddress }),
              });
              router.push(`/app/settings/aliases/${String(alias._id)}`);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to create alias");
            }
          }}
        >
          Create alias
        </Button>
      </Card>
    </SettingsShell>
  );
}
