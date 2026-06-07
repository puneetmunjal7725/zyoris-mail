"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { clientApi } from "@/lib/client-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMailDate, groupEmailsByDate } from "@/lib/mail-date";

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
  const q = searchParams.get("q") || "";
  const mailbox = searchParams.get("mailbox") || "";
  const label = searchParams.get("label") || "";
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

  const allSelected = useMemo(() => emails.length > 0 && selected.size === emails.length, [emails, selected]);
  const grouped = useMemo(() => groupEmailsByDate(emails), [emails]);

  async function bulk(action: string) {
    if (!selected.size) return;
    await clientApi("/api/emails/bulk", {
      method: "PATCH",
      body: JSON.stringify({ emailIds: Array.from(selected), action }),
    });
    setSelected(new Set());
    await load();
  }

  async function toggleStar(email: EmailRow, e: React.MouseEvent) {
    e.stopPropagation();
    await clientApi("/api/emails", {
      method: "PATCH",
      body: JSON.stringify({ emailId: email._id, action: email.isStarred ? "UNSTAR" : "STAR" }),
    });
    await load();
  }

  return (
    <Card className="overflow-hidden p-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <div className="flex flex-wrap gap-2">
          <Button className="h-8 bg-[var(--card)] text-xs text-[var(--foreground)] border border-[var(--border)]" onClick={() => bulk("MARK_READ")}>
            Mark read
          </Button>
          <Button className="h-8 bg-[var(--card)] text-xs text-[var(--foreground)] border border-[var(--border)]" onClick={() => bulk("ARCHIVE")}>
            Archive
          </Button>
          <Button className="h-8 bg-[var(--card)] text-xs text-[var(--foreground)] border border-[var(--border)]" onClick={() => bulk("DELETE")}>
            Delete
          </Button>
        </div>
      </div>

      {error && <div className="p-4 text-sm text-red-700">{error}</div>}
      {loading ? (
        <div className="p-8 text-sm text-[var(--muted)]">Loading messages…</div>
      ) : emails.length === 0 ? (
        <div className="p-8 text-sm text-[var(--muted)]">No messages in this folder.</div>
      ) : (
        <div>
          <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--secondary)] px-4 py-2 text-xs text-[var(--muted)]">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => setSelected(e.target.checked ? new Set(emails.map((x) => x._id)) : new Set())}
            />
            <span>{selected.size} selected</span>
          </div>
          {grouped.map(([group, rows]) => (
            <div key={group}>
              <div className="gmail-date-group">{group}</div>
              {rows.map((email) => (
                <div
                  key={email._id}
                  className={`gmail-row flex cursor-pointer items-center gap-3 border-b border-[var(--border)] px-4 py-2 ${email.isRead ? "text-[var(--muted)]" : "gmail-row-unread text-[var(--foreground)]"}`}
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
                  <button
                    type="button"
                    className={`text-base ${email.isStarred ? "text-[var(--pastel-peach)]" : "text-[var(--muted)]"}`}
                    onClick={(e) => toggleStar(email, e)}
                    aria-label="Star"
                  >
                    {email.isStarred ? "★" : "☆"}
                  </button>
                  <div className="w-36 shrink-0 truncate text-sm">{email.from.replace(/<.*>/, "").trim()}</div>
                  <div className="min-w-0 flex-1 truncate text-sm">
                    <span className={email.isRead ? "" : "font-semibold"}>{email.subject || "(no subject)"}</span>
                    <span className="text-[var(--muted)]"> — {email.bodyText.slice(0, 80)}</span>
                  </div>
                  <div className="w-16 shrink-0 text-right text-xs text-[var(--muted)]">
                    {formatMailDate(email.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
