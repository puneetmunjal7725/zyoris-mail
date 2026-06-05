"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { clientApi } from "@/lib/client-api";

export default function AliasesPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    clientApi<any[]>("/api/aliases").then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Aliases</h2>
        <Link className="rounded-xl bg-[var(--primary)] px-3 py-2 text-sm text-white" href="/app/aliases/create">
          Create alias
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No aliases yet.</p>
        ) : (
          rows.map((a) => (
            <Link
              key={String(a._id)}
              href={`/app/aliases/${String(a._id)}`}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm hover:bg-[var(--accent)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{a.sourceAddress}</div>
                  <div className="text-xs text-[var(--muted)]">→ {a.destinationAddress}</div>
                </div>
                <div className="text-xs text-[var(--muted)]">{a.isEnabled ? "Enabled" : "Disabled"}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
