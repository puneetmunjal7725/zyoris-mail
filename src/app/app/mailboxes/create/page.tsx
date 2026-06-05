"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CreateMailboxPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<any[]>([]);
  const [domainId, setDomainId] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [storageLimitBytes, setStorageLimitBytes] = useState("1073741824");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/domains", { cache: "no-store" });
      if (!res.ok) return;
      const rows = await res.json();
      setDomains(rows.filter((d: any) => d.status === "VERIFIED"));
    })();
  }, []);

  return (
    <Card>
      <h2 className="text-xl font-semibold">Create mailbox</h2>
      <div className="mt-4 space-y-3">
        <div className="space-y-1">
          <div className="text-xs text-[#5A6175]">Domain (verified only)</div>
          <select
            className="h-10 w-full rounded-lg border border-[#E6E8EE] bg-white px-3 text-sm dark:border-[#252833] dark:bg-[#11131A]"
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
          >
            <option value="">Select domain</option>
            {domains.map((d) => (
              <option key={String(d._id)} value={String(d._id)}>
                {d.domain}
              </option>
            ))}
          </select>
        </div>
        <Input placeholder="Username (e.g. support)" value={username} onChange={(e) => setUsername(e.target.value)} />
        <Input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <Input type="password" placeholder="Mailbox password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <Input
          placeholder="Storage limit bytes"
          value={storageLimitBytes}
          onChange={(e) => setStorageLimitBytes(e.target.value)}
        />
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <Button
          className="w-full"
          onClick={async () => {
            setError(null);
            const res = await fetch("/api/mailboxes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                domainId,
                username,
                displayName,
                password,
                storageLimitBytes: Number(storageLimitBytes || 0) || undefined,
              }),
            });
            if (!res.ok) {
              const j = await res.json().catch(() => ({}));
              setError(j.error?.message || j.error || "Failed to create mailbox");
              return;
            }
            const mailbox = await res.json();
            router.push(`/app/mailboxes/${String(mailbox._id)}`);
          }}
        >
          Create
        </Button>
      </div>
    </Card>
  );
}

