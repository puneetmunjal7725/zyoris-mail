"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { clientApi } from "@/lib/client-api";

export default function MailboxesPage() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    clientApi<any[]>("/api/mailboxes").then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Mailboxes</h2>
        <Link className="rounded-xl bg-[var(--primary)] px-3 py-2 text-sm text-white" href="/app/mailboxes/create">
          Create mailbox
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No mailboxes yet.</p>
        ) : (
          rows.map((m) => (
            <Link
              key={String(m._id)}
              href={`/app/mailboxes/${String(m._id)}`}
              className="block rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm hover:bg-[var(--accent)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{m.emailAddress}</div>
                  <div className="text-xs text-[var(--muted)]">{m.displayName}</div>
                </div>
                <div className="text-right text-xs text-[var(--muted)]">
                  <div>{m.isSuspended ? "Suspended" : "Active"}</div>
                  <div>
                    {Number(m.storageUsedBytes || 0).toLocaleString()} / {Number(m.storageLimitBytes || 0).toLocaleString()} bytes
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
