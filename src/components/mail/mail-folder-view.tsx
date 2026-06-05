"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { clientApi } from "@/lib/client-api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

type EmailRow = {
  _id: string;
  from: string;
  subject: string;
  bodyText: string;
  createdAt: string;
  isRead: boolean;
  isStarred: boolean;
  mailbox: string;
  labels?: string[];
};

type Props = {
  folder: string;
  title: string;
};

export function MailFolderView({ folder, title }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [mailbox, setMailbox] = useState(searchParams.get("mailbox") || "");
  const [label, setLabel] = useState(searchParams.get("label") || "");
  const [mailboxes, setMailboxes] = useState<{ _id: string; emailAddress: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ folder });
      if (q) params.set("q", q);
      if (mailbox) params.set("mailbox", mailbox);
      if (label) params.set("label", label);
      const rows = await clientApi<EmailRow[]>(`/api/emails?${params.toString()}`);
      setEmails(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load emails");
    } finally {
      setLoading(false);
    }
  }, [folder, q, mailbox, label]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    clientApi<{ _id: string; emailAddress: string }[]>("/api/mailboxes")
      .then(setMailboxes)
      .catch(() => undefined);
  }, []);

  const allSelected = useMemo(() => emails.length > 0 && selected.size === emails.length, [emails, selected]);

  async function bulk(action: string) {
    if (!selected.size) return;
    await clientApi("/api/emails/bulk", {
      method: "PATCH",
      body: JSON.stringify({ emailIds: Array.from(selected), action }),
    });
    setSelected(new Set());
    await load();
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="border-b border-[var(--border)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Link href="/app/compose" className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-white">
            Compose
          </Link>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
          <Input placeholder="Search mail" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <select
            className="h-10 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 text-sm"
            value={mailbox}
            onChange={(e) => setMailbox(e.target.value)}
          >
            <option value="">All mailboxes</option>
            {mailboxes.map((m) => (
              <option key={m._id} value={m.emailAddress}>
                {m.emailAddress}
              </option>
            ))}
          </select>
          <Input placeholder="Label filter" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button onClick={load}>Apply filters</Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]" onClick={() => bulk("MARK_READ")}>
            Mark read
          </Button>
          <Button className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]" onClick={() => bulk("DELETE")}>
            Delete
          </Button>
          <Button className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]" onClick={() => bulk("STAR")}>
            Star
          </Button>
          <Button className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]" onClick={() => bulk("ARCHIVE")}>
            Archive
          </Button>
        </div>
      </div>

      {error && <div className="p-4 text-sm text-red-600">{error}</div>}
      {loading ? (
        <div className="p-8 text-sm text-[var(--muted)]">Loading messages…</div>
      ) : emails.length === 0 ? (
        <div className="p-8 text-sm text-[var(--muted)]">No messages in this folder.</div>
      ) : (
        <div>
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => setSelected(e.target.checked ? new Set(emails.map((x) => x._id)) : new Set())}
            />
            <span>{selected.size} selected</span>
          </div>
          {emails.map((email) => (
            <div
              key={email._id}
              className={`flex cursor-pointer items-start gap-3 border-b border-[var(--border)] px-4 py-3 hover:bg-[var(--accent)] ${email.isRead ? "" : "bg-[var(--accent)]/60"}`}
              onClick={() => router.push(`/app/email/${email._id}`)}
            >
              <input
                type="checkbox"
                checked={selected.has(email._id)}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const next = new Set(selected);
                  if (e.target.checked) next.add(email._id);
                  else next.delete(email._id);
                  setSelected(next);
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className={`truncate text-sm ${email.isRead ? "" : "font-semibold"}`}>{email.from}</div>
                  <div className="shrink-0 text-xs text-[var(--muted)]">
                    {formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })}
                  </div>
                </div>
                <div className={`truncate text-sm ${email.isRead ? "text-[var(--muted)]" : "font-medium"}`}>{email.subject}</div>
                <div className="truncate text-xs text-[var(--muted)]">{email.bodyText.slice(0, 120)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
