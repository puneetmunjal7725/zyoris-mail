"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";

export default function AliasDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params?.id || "");
  const [alias, setAlias] = useState<any | null>(null);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi<any[]>("/api/aliases")
      .then((rows) => {
        const found = rows.find((r) => String(r._id) === id);
        if (!found) return;
        setAlias(found);
        setDestinationAddress(found.destinationAddress || "");
      })
      .catch(() => setAlias(null));
  }, [id]);

  if (!alias) {
    return (
      <SettingsShell title="Alias">
        <Card>Loading…</Card>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell title={alias.sourceAddress}>
      <Card className="max-w-lg">
        <p className="text-sm text-[var(--muted)]">Forwards to {alias.destinationAddress}</p>

        <div className="mt-4 space-y-2 rounded-lg border border-[var(--border)] bg-[var(--secondary)] p-3">
          <div className="text-sm font-medium">Update destination</div>
          <div className="flex gap-2">
            <Input value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} placeholder="Destination address" />
            <Button
              onClick={async () => {
                try {
                  setError(null);
                  setAlias(
                    await clientApi(`/api/aliases/${id}`, {
                      method: "PATCH",
                      body: JSON.stringify({ destinationAddress }),
                    })
                  );
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to update alias");
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <ButtonSecondary
            onClick={async () => {
              try {
                setError(null);
                setAlias(
                  await clientApi(`/api/aliases/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify({ isEnabled: !alias.isEnabled }),
                  })
                );
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to toggle alias");
              }
            }}
          >
            {alias.isEnabled ? "Disable" : "Enable"}
          </ButtonSecondary>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={async () => {
              if (!confirm("Delete this alias?")) return;
              try {
                setError(null);
                await clientApi(`/api/aliases/${id}`, { method: "DELETE" });
                router.push("/app/settings/aliases");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to delete alias");
              }
            }}
          >
            Delete alias
          </Button>
        </div>

        {error && <div className="mt-3 zyoris-error">{error}</div>}
      </Card>
    </SettingsShell>
  );
}
