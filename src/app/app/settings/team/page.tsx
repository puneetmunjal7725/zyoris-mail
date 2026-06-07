"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";

export default function TeamEmailsPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    clientApi<any[]>("/api/mailboxes").then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <SettingsShell title="Team emails">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">Email addresses your team can send and receive from.</p>
          <Link href="/app/settings/team/create">
            <Button>Add email</Button>
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No team emails yet. Add your first address.</p>
          ) : (
            rows.map((m) => (
              <Link
                key={String(m._id)}
                href={`/app/settings/team/${String(m._id)}`}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm hover:bg-[var(--secondary)]"
              >
                <div>
                  <div className="font-medium">{m.emailAddress}</div>
                  <div className="text-xs text-[var(--muted)]">{m.displayName}</div>
                </div>
                <span className="text-xs text-[var(--muted)]">{m.isSuspended ? "Paused" : "Active"}</span>
              </Link>
            ))
          )}
        </div>
      </Card>
    </SettingsShell>
  );
}
