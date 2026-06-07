"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";

export default function TeamEmailDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params?.id || "");
  const [mailbox, setMailbox] = useState<any | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi(`/api/mailboxes/${id}`)
      .then(setMailbox)
      .catch(() => setMailbox(null));
  }, [id]);

  if (!mailbox) {
    return (
      <SettingsShell title="Team email">
        <Card>Loading…</Card>
      </SettingsShell>
    );
  }

  const used = Number(mailbox.storageUsedBytes || 0);
  const limit = Number(mailbox.storageLimitBytes || 0);
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <SettingsShell title={mailbox.emailAddress}>
      <Card className="max-w-lg">
        <p className="text-sm text-[var(--muted)]">{mailbox.displayName}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          {mailbox.isSuspended ? "Suspended" : "Active"} · Sent {mailbox.sentCount || 0} · Received {mailbox.receivedCount || 0}
        </p>

        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--secondary)] p-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium">Storage</div>
            <div className="text-xs text-[var(--muted)]">
              {used.toLocaleString()} / {limit.toLocaleString()} bytes ({pct}%)
            </div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-[var(--border)]">
            <div className="h-2 rounded-full bg-[var(--pastel-blue)]" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Button
            onClick={async () => {
              try {
                setError(null);
                setMailbox(await clientApi(`/api/mailboxes/${id}`, { method: "PATCH", body: JSON.stringify({ suspend: true }) }));
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to suspend mailbox");
              }
            }}
          >
            Suspend
          </Button>
          <ButtonSecondary
            onClick={async () => {
              try {
                setError(null);
                setMailbox(await clientApi(`/api/mailboxes/${id}`, { method: "PATCH", body: JSON.stringify({ reactivate: true }) }));
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to reactivate mailbox");
              }
            }}
          >
            Reactivate
          </ButtonSecondary>
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--secondary)] p-3">
          <div className="text-sm font-medium">Reset password</div>
          <div className="mt-2 flex gap-2">
            <Input type="password" placeholder="New password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
            <Button
              onClick={async () => {
                try {
                  setError(null);
                  await clientApi(`/api/mailboxes/${id}`, { method: "PATCH", body: JSON.stringify({ resetPassword }) });
                  setResetPassword("");
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to reset password");
                }
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={async () => {
              if (!confirm("Delete this mailbox?")) return;
              try {
                setError(null);
                await clientApi(`/api/mailboxes/${id}`, { method: "DELETE" });
                router.push("/app/settings/team");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Failed to delete mailbox");
              }
            }}
          >
            Delete mailbox
          </Button>
        </div>

        {error && <div className="mt-3 zyoris-error">{error}</div>}
      </Card>
    </SettingsShell>
  );
}
