"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateAliasPage() {
  const router = useRouter();
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [mailboxId, setMailboxId] = useState("");
  const [sourceAddress, setSourceAddress] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/mailboxes", { cache: "no-store" });
      if (!res.ok) return;
      setMailboxes(await res.json());
    })();
  }, []);

  return (
    <Card>
      <h2 className="text-xl font-semibold">Create alias</h2>
      <div className="mt-4 space-y-3">
        <div className="space-y-1">
          <div className="text-xs text-[#5A6175]">Mailbox</div>
          <select
            className="h-10 w-full rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm dark:border-[#252833] dark:bg-[#11131A]"
            value={mailboxId}
            onChange={(e) => setMailboxId(e.target.value)}
          >
            <option value="">Select mailbox</option>
            {mailboxes.map((m) => (
              <option key={String(m._id)} value={String(m._id)}>
                {m.emailAddress}
              </option>
            ))}
          </select>
        </div>
        <Input placeholder="Alias address (source)" value={sourceAddress} onChange={(e) => setSourceAddress(e.target.value)} />
        <Input placeholder="Destination address" value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <Button
          className="w-full"
          onClick={async () => {
            setError(null);
            const res = await fetch("/api/aliases", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ mailboxId, sourceAddress, destinationAddress }),
            });
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              setError(j.error?.message || j.error || "Failed to create alias");
              return;
            }
            const alias = await res.json();
            router.push(`/app/aliases/${String(alias._id)}`);
          }}
        >
          Create
        </Button>
      </div>
    </Card>
  );
}

