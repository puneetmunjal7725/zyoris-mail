"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { clientApi } from "@/lib/client-api";

const DRAFT_KEY = "zyoris_compose_draft";

type Draft = {
  mailbox: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  html: string;
  attachments: string[];
};

type Props = {
  minimized: boolean;
  expanded: boolean;
  onMinimize: () => void;
  onExpand: () => void;
  onClose: () => void;
};

export function ComposeWidget({ minimized, expanded, onMinimize, onExpand, onClose }: Props) {
  const router = useRouter();
  const [mailboxes, setMailboxes] = useState<{ _id: string; emailAddress: string }[]>([]);
  const [mailbox, setMailbox] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p></p>");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
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
          setSubject(draft.subject || "");
          setHtml(draft.html || "<p></p>");
          setAttachments(draft.attachments || []);
          return;
        } catch {
          /* ignore */
        }
      }
      if (rows[0]) setMailbox(rows[0].emailAddress);
    });
  }, []);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const draft: Draft = { mailbox, to, cc, bcc, subject, html, attachments };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setSavedAt(new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }));
    }, 1500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [mailbox, to, cc, bcc, subject, html, attachments]);

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
    setError(null);
    try {
      await clientApi("/api/emails/send", {
        method: "POST",
        body: JSON.stringify({
          mailbox,
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
      onClose();
      router.push("/app/sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    }
  }

  const width = expanded ? "min(720px, calc(100vw - 2rem))" : "min(520px, calc(100vw - 2rem))";
  const height = minimized ? "auto" : expanded ? "min(640px, calc(100vh - 4rem))" : "420px";

  return (
    <div
      className="compose-window fixed bottom-0 right-4 z-50 flex flex-col overflow-hidden"
      style={{ width, height: minimized ? "auto" : height }}
    >
      <div className="compose-titlebar flex items-center justify-between px-3 py-2">
        <span className="text-sm font-medium">New message</span>
        <div className="flex items-center gap-1">
          {savedAt && !minimized && <span className="mr-2 text-xs text-[var(--muted)]">Draft saved {savedAt}</span>}
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-[var(--secondary)]" onClick={onMinimize} aria-label="Minimize">
            −
          </button>
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-[var(--secondary)]" onClick={onExpand} aria-label="Expand">
            ⤢
          </button>
          <button type="button" className="rounded px-2 py-1 text-xs hover:bg-[var(--secondary)]" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="flex flex-1 flex-col overflow-auto p-3">
          <select
            className="mb-2 h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-2 text-sm"
            value={mailbox}
            onChange={(e) => setMailbox(e.target.value)}
          >
            {mailboxes.map((m) => (
              <option key={m._id} value={m.emailAddress}>
                {m.emailAddress}
              </option>
            ))}
          </select>
          <Input className="mb-2 h-9" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipients" />
          <Input className="mb-2 h-9" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="Cc" />
          <Input className="mb-2 h-9" value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="Bcc" />
          <Input className="mb-2 h-9" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          <div className="min-h-[140px] flex-1 overflow-auto rounded-lg border border-[var(--border)]">
            <RichTextEditor value={html} onChange={setHtml} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <label className="cursor-pointer text-xs text-[var(--muted)]">
              <input
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await uploadFile(file);
                }}
              />
              Attach files
            </label>
            {attachments.length > 0 && <span className="text-xs text-[var(--muted)]">{attachments.length} attached</span>}
          </div>
          {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button onClick={send}>Send</Button>
            <ButtonSecondary onClick={onClose}>Discard</ButtonSecondary>
          </div>
        </div>
      )}
    </div>
  );
}
