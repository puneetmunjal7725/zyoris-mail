"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { clientApi } from "@/lib/client-api";
import { useToast } from "@/components/ui/toast-provider";

const DRAFT_KEY = "zyoris_compose_draft";

type Draft = {
  mailbox: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  attachments: string[];
  showCcBcc: boolean;
};

function ComposeField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--border)] py-1.5">
      <span className="w-14 shrink-0 text-xs font-medium uppercase text-[var(--muted)]">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

type Props = {
  minimized: boolean;
  expanded: boolean;
  onMinimize: () => void;
  onExpand: () => void;
  onClose: () => void;
};

export function ComposeWidget({ minimized, expanded, onMinimize, onExpand, onClose }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [mailboxes, setMailboxes] = useState<{ _id: string; emailAddress: string; displayName?: string }[]>([]);
  const [mailbox, setMailbox] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p></p>");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    clientApi<{ _id: string; emailAddress: string }[]>("/api/mailboxes").then((rows) => {
      setMailboxes(rows);
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        try {
          const draft = JSON.parse(raw) as Draft;
          setMailbox(draft.mailbox || rows[0]?.emailAddress || "");
          setTo(draft.to || "");
          setCc(draft.cc || "");
          setBcc(draft.bcc || "");
          setShowCcBcc(draft.showCcBcc || false);
          setSubject(draft.subject || "");
          setHtml(draft.html || "<p></p>");
          setAttachments(draft.attachments || []);
          return;
        } catch { /* ignore */ }
      }
      if (rows[0]) setMailbox(rows[0].emailAddress);
    });
  }, []);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const draft: Draft = { mailbox, to, cc, bcc, subject, html, attachments, showCcBcc };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setSavedAt(new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }));
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [mailbox, to, cc, bcc, subject, html, attachments, showCcBcc]);

  async function uploadFile(file: File) {
    const list = mailboxes.length ? mailboxes : await clientApi<{ _id: string; emailAddress: string }[]>("/api/mailboxes");
    const match = list.find((m) => m.emailAddress === mailbox);
    if (!match) throw new Error("Select a mailbox first");
    const form = new FormData();
    form.append("file", file);
    form.append("mailboxId", match._id);
    const att = await clientApi<{ _id: string }>("/api/attachments/upload", { method: "POST", body: form });
    setAttachments((prev) => [...prev, att._id]);
  }

  async function send() {
    if (!mailbox) {
      toast("Select a sender mailbox first", "error");
      return;
    }
    if (!to.trim()) {
      toast("Add at least one recipient", "error");
      return;
    }
    if (!subject.trim()) {
      toast("Add a subject", "error");
      return;
    }
    setError(null);
    setSending(true);
    try {
      await clientApi("/api/emails/send", {
        method: "POST",
        body: JSON.stringify({
          mailbox,
          from: mailbox,
          to: to.split(",").map((x) => x.trim()).filter(Boolean),
          cc: cc ? cc.split(",").map((x) => x.trim()).filter(Boolean) : undefined,
          bcc: bcc ? bcc.split(",").map((x) => x.trim()).filter(Boolean) : undefined,
          subject,
          bodyHtml: html,
          bodyText: html.replace(/<[^>]+>/g, " "),
          attachments,
        }),
      });
      localStorage.removeItem(DRAFT_KEY);
      toast("Email sent", "success");
      onClose();
      router.push("/app/sent");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Send failed";
      setError(msg);
      toast(msg, "error");
    } finally {
      setSending(false);
    }
  }

  const width = expanded ? "min(720px, calc(100vw - 2rem))" : "min(520px, calc(100vw - 2rem))";
  const height = minimized ? "auto" : expanded ? "min(640px, calc(100vh - 4rem))" : "460px";

  return (
    <div className="compose-window fixed bottom-0 right-4 z-50 flex flex-col overflow-hidden" style={{ width, height: minimized ? "auto" : height }}>
      <div className="compose-titlebar flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium">New message</span>
        <div className="flex items-center gap-1">
          {savedAt && !minimized && <span className="mr-2 text-xs text-[var(--muted)]">Saved {savedAt}</span>}
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-[var(--secondary)]" onClick={onMinimize}>−</button>
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-[var(--secondary)]" onClick={onExpand}>⤢</button>
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-[var(--secondary)]" onClick={onClose}>×</button>
        </div>
      </div>

      {!minimized && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="shrink-0 px-3 pt-2">
            <ComposeField label="From">
              {mailboxes.length === 0 ? (
                <span className="text-sm text-[var(--muted)]">No mailbox — add one in Settings → Team emails</span>
              ) : (
                <select className="h-8 w-full bg-transparent text-sm font-medium outline-none" value={mailbox} onChange={(e) => setMailbox(e.target.value)}>
                  {mailboxes.map((m) => (
                    <option key={m._id} value={m.emailAddress}>
                      {m.displayName ? `${m.displayName} <${m.emailAddress}>` : m.emailAddress}
                    </option>
                  ))}
                </select>
              )}
            </ComposeField>
            <ComposeField label="To">
              <div className="flex items-center gap-2">
                <input className="h-8 w-full bg-transparent text-sm outline-none" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipients" />
                {!showCcBcc && (
                  <button type="button" className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]" onClick={() => setShowCcBcc(true)}>Cc Bcc</button>
                )}
              </div>
            </ComposeField>
            {showCcBcc && (
              <>
                <ComposeField label="Cc"><input className="h-8 w-full bg-transparent text-sm outline-none" value={cc} onChange={(e) => setCc(e.target.value)} /></ComposeField>
                <ComposeField label="Bcc"><input className="h-8 w-full bg-transparent text-sm outline-none" value={bcc} onChange={(e) => setBcc(e.target.value)} /></ComposeField>
              </>
            )}
            <ComposeField label="Subject">
              <input className="h-8 w-full bg-transparent text-sm outline-none" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
            </ComposeField>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-3 py-2">
            <RichTextEditor value={html} onChange={setHtml} />
          </div>
          <div className="flex items-center justify-between border-t border-[var(--border)] px-3 py-2">
            <div className="flex items-center gap-3">
              <Button onClick={send} disabled={sending || !mailbox}>{sending ? "Sending…" : "Send"}</Button>
              <label className="cursor-pointer text-xs text-[var(--muted)] hover:text-[var(--foreground)]">
                <input type="file" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) await uploadFile(f); }} />
                Attach
              </label>
              {attachments.length > 0 && <span className="text-xs text-[var(--muted)]">{attachments.length} file(s)</span>}
            </div>
            <ButtonSecondary onClick={onClose}>Discard</ButtonSecondary>
          </div>
          {error && <p className="px-3 pb-2 text-xs text-red-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
