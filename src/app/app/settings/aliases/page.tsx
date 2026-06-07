"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";

export default function SettingsAliasesPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    clientApi<any[]>("/api/aliases").then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <SettingsShell title="Aliases">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[var(--muted)]">Forward one address to another — e.g. support@ → info@</p>
          <Link href="/app/settings/aliases/create" className="rounded-lg bg-[var(--pastel-indigo)] px-3 py-2 text-sm font-medium">
            Add alias
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No aliases yet.</p>
          ) : (
            rows.map((a) => (
              <Link
                key={String(a._id)}
                href={`/app/settings/aliases/${String(a._id)}`}
                className="block rounded-lg border border-[var(--border)] p-3 text-sm hover:bg-[var(--secondary)]"
              >
                <div className="font-medium">{a.sourceAddress}</div>
                <div className="text-xs text-[var(--muted)]">forwards to {a.destinationAddress}</div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </SettingsShell>
  );
}
