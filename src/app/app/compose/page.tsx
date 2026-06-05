"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { clientApi } from "@/lib/client-api";

export default function ComposePage() {
  const router = useRouter();
  const [mailboxes, setMailboxes] = useState<{ emailAddress: string }[]>([]);
  const [mailbox, setMailbox] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p></p>");
  const [sendAt, setSendAt] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi<{ emailAddress: string }[]>("/api/mailboxes").then((rows) => {
      setMailboxes(rows);
      if (rows[0]) setMailbox(rows[0].emailAddress);
    });
  }, []);

  async function uploadFile(file: File) {
    const form = new FormData();
    const mb = mailboxes.find((m) => m.emailAddress === mailbox);
    if (!mb) throw new Error("Select a mailbox first");
    form.append("file", file);
    const list = await clientApi<any[]>("/api/mailboxes");
    const match = list.find((m) => m.emailAddress === mailbox);
    if (!match) throw new Error("Mailbox not found");
    form.append("mailboxId", match._id);
    const att = await clientApi<{ _id: string }>("/api/attachments/upload", { method: "POST", body: form });
    setAttachments((prev) => [...prev, att._id]);
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold">Compose</h2>
      <div className="mt-4 space-y-3">
        <select className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3" value={mailbox} onChange={(e) => setMailbox(e.target.value)}>
          {mailboxes.map((m) => (
            <option key={m.emailAddress} value={m.emailAddress}>
              {m.emailAddress}
            </option>
          ))}
        </select>
        <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To (comma separated)" />
        <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="CC" />
        <Input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="BCC" />
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
        <RichTextEditor value={html} onChange={setHtml} />
        <Input type="datetime-local" value={sendAt} onChange={(e) => setSendAt(e.target.value)} />
        <input
          type="file"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) await uploadFile(file);
          }}
        />
        {attachments.length > 0 && <p className="text-sm text-[var(--muted)]">{attachments.length} attachment(s) added</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button
            onClick={async () => {
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
                    sendAt: sendAt ? new Date(sendAt).toISOString() : undefined,
                  }),
                });
                router.push(sendAt ? "/app/drafts" : "/app/sent");
              } catch (e) {
                setError(e instanceof Error ? e.message : "Send failed");
              }
            }}
          >
            Send
          </Button>
          <Button
            className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]"
            onClick={async () => {
              await clientApi("/api/emails/send", {
                method: "POST",
                body: JSON.stringify({
                  mailbox,
                  to: to.split(",").map((x) => x.trim()).filter(Boolean),
                  subject: subject || "(no subject)",
                  bodyHtml: html,
                  bodyText: html.replace(/<[^>]+>/g, " "),
                  sendAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                }),
              });
              router.push("/app/drafts");
            }}
          >
            Save draft
          </Button>
        </div>
      </div>
    </Card>
  );
}
