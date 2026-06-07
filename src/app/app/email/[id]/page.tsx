"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { clientApi } from "@/lib/client-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

type EmailDoc = {
  _id: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  bodyHtml: string;
  bodyText: string;
  mailbox: string;
  createdAt: string;
  attachments?: string[];
};

type AttachmentMeta = { _id: string; filename: string; mimeType: string; size: number };

export default function EmailDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params.id);
  const [email, setEmail] = useState<EmailDoc | null>(null);
  const [thread, setThread] = useState<EmailDoc[]>([]);
  const [replyHtml, setReplyHtml] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);

  useEffect(() => {
    clientApi<{ email: EmailDoc; thread: EmailDoc[]; attachments?: AttachmentMeta[] }>(`/api/emails/${id}`)
      .then((data) => {
        setEmail(data.email);
        setThread(data.thread);
        setAttachments(data.attachments || []);
        setReplyTo(data.email.from);
        setReplyHtml(`<p><br></p><p>---</p><p>${data.email.bodyHtml}</p>`);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load email"));
  }, [id]);

  if (error) return <Card className="text-red-600">{error}</Card>;
  if (!email) return <Card>Loading message…</Card>;

  async function sendReply(mode: "reply" | "reply-all" | "forward") {
    if (!email) return;
    let to = [replyTo];
    let cc: string[] | undefined;
    let subject = email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`;
    let bodyHtml = replyHtml;

    if (mode === "reply-all") {
      to = Array.from(new Set([email.from, ...email.to.filter((x) => x !== email.mailbox)]));
      cc = email.cc;
    }
    if (mode === "forward") {
      to = replyTo.split(",").map((x) => x.trim()).filter(Boolean);
      subject = email.subject.startsWith("Fwd:") ? email.subject : `Fwd: ${email.subject}`;
      bodyHtml = `<p>Forwarded message</p>${email.bodyHtml}`;
    }

    await clientApi("/api/emails/send", {
      method: "POST",
      body: JSON.stringify({
        mailbox: email.mailbox,
        to,
        cc,
        subject,
        bodyHtml,
        bodyText: bodyHtml.replace(/<[^>]+>/g, " "),
        replyToEmailId: email._id,
      }),
    });
    router.push("/app/sent");
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">{email.subject}</h2>
          <div className="flex gap-2">
            <Button className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]" onClick={() => router.back()}>
              Back
            </Button>
            <Button
              onClick={async () => {
                await clientApi("/api/emails", { method: "PATCH", body: JSON.stringify({ emailId: email._id, action: "STAR" }) });
              }}
            >
              Star
            </Button>
            <Button
              className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]"
              onClick={async () => {
                await clientApi("/api/emails", { method: "PATCH", body: JSON.stringify({ emailId: email._id, action: "ARCHIVE" }) });
                router.push("/app/archive");
              }}
            >
              Archive
            </Button>
            <Button
              className="bg-red-600 text-white"
              onClick={async () => {
                await clientApi("/api/emails", { method: "PATCH", body: JSON.stringify({ emailId: email._id, action: "DELETE" }) });
                router.push("/app/trash");
              }}
            >
              Delete
            </Button>
          </div>
        </div>
        <div className="mt-2 text-sm text-[var(--muted)]">
          From: {email.from} • To: {email.to.join(", ")} • Mailbox: {email.mailbox}
        </div>
        {attachments.length > 0 && (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <h3 className="text-sm font-semibold">Attachments</h3>
            <ul className="mt-2 space-y-2">
              {attachments.map((a) => (
                <li key={a._id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm">
                  <span>
                    {a.filename} <span className="text-[var(--muted)]">({Math.round(a.size / 1024)} KB)</span>
                  </span>
                  <Button
                    className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]"
                    onClick={async () => {
                      const data = await clientApi<{ url: string }>(`/api/attachments/${a._id}`);
                      window.open(data.url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    {a.mimeType.startsWith("image/") ? "Preview" : "Download"}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4 prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: email.bodyHtml }} />
      </Card>

      {thread.length > 1 && (
        <Card>
          <h3 className="font-semibold">Thread ({thread.length})</h3>
          <div className="mt-3 space-y-2">
            {thread.map((m) => (
              <div key={m._id} className="rounded-lg border border-[var(--border)] p-3 text-sm">
                <div className="font-medium">{m.from}</div>
                <div className="text-[var(--muted)]">{m.subject}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <h3 className="font-semibold">Reply</h3>
        <div className="mt-3 space-y-3">
          <Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="To" />
          <RichTextEditor value={replyHtml} onChange={setReplyHtml} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => sendReply("reply")}>Reply</Button>
            <Button onClick={() => sendReply("reply-all")}>Reply all</Button>
            <Button onClick={() => sendReply("forward")}>Forward</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
