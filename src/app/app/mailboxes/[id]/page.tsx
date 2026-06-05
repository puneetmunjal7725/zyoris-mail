"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MailboxDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params?.id || "");
  const [mailbox, setMailbox] = useState<any | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/mailboxes/${id}`, { cache: "no-store" });
      if (!res.ok) return;
      setMailbox(await res.json());
    })();
  }, [id]);

  if (!mailbox) return <Card>Loading…</Card>;

  const used = Number(mailbox.storageUsedBytes || 0);
  const limit = Number(mailbox.storageLimitBytes || 0);
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{mailbox.emailAddress}</h2>
          <div className="mt-1 text-sm text-[#5A6175]">{mailbox.displayName}</div>
          <div className="mt-2 text-xs text-[#5A6175]">
            Status: {mailbox.isSuspended ? "Suspended" : "Active"} • Sent: {mailbox.sentCount || 0} • Received:{" "}
            {mailbox.receivedCount || 0}
          </div>
        </div>
        <Button
          className="bg-white text-[#0B0D14] border border-[#E6E8EE] dark:bg-[#11131A] dark:text-[#E6E8EE] dark:border-[#252833]"
          onClick={() => {
            router.push("/app/mailboxes");
          }}
        >
          Back
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-[#E6E8EE] bg-white p-3 text-sm dark:border-[#252833] dark:bg-[#11131A]">
        <div className="flex items-center justify-between">
          <div className="font-medium">Storage usage</div>
          <div className="text-xs text-[#5A6175]">
            {used.toLocaleString()} / {limit.toLocaleString()} bytes ({pct}%)
          </div>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-[#EEF2FF] dark:bg-[#1A1F2D]">
          <div className="h-2 rounded-full bg-[#3A66F7]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Button
          onClick={async () => {
            setError(null);
            const res = await fetch(`/api/mailboxes/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ suspend: true }),
            });
            if (!res.ok) return setError("Failed to suspend mailbox");
            setMailbox(await res.json());
          }}
        >
          Suspend
        </Button>
        <Button
          className="bg-white text-[#0B0D14] border border-[#E6E8EE] dark:bg-[#11131A] dark:text-[#E6E8EE] dark:border-[#252833]"
          onClick={async () => {
            setError(null);
            const res = await fetch(`/api/mailboxes/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reactivate: true }),
            });
            if (!res.ok) return setError("Failed to reactivate mailbox");
            setMailbox(await res.json());
          }}
        >
          Reactivate
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-[#E6E8EE] bg-white p-3 dark:border-[#252833] dark:bg-[#11131A]">
        <div className="text-sm font-medium">Reset mailbox password</div>
        <div className="mt-2 flex gap-2">
          <Input type="password" placeholder="New password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
          <Button
            onClick={async () => {
              setError(null);
              const res = await fetch(`/api/mailboxes/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ resetPassword }),
              });
              if (!res.ok) return setError("Failed to reset password");
              setResetPassword("");
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Button
          className="bg-red-600 text-white dark:bg-red-600"
          onClick={async () => {
            if (!confirm("Delete this mailbox?")) return;
            setError(null);
            const res = await fetch(`/api/mailboxes/${id}`, { method: "DELETE" });
            if (!res.ok) return setError("Failed to delete mailbox");
            router.push("/app/mailboxes");
          }}
        >
          Delete mailbox
        </Button>
      </div>

      {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
    </Card>
  );
}

