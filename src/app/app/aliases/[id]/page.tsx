"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AliasDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = String(params?.id || "");
  const [alias, setAlias] = useState<any | null>(null);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/aliases", { cache: "no-store" });
      if (!res.ok) return;
      const rows = (await res.json()) as any[];
      const found = rows.find((r) => String(r._id) === id);
      if (!found) return;
      setAlias(found);
      setDestinationAddress(found.destinationAddress || "");
    })();
  }, [id]);

  if (!alias) return <Card>Loading…</Card>;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{alias.sourceAddress}</h2>
          <div className="mt-1 text-sm text-[#5A6175]">→ {alias.destinationAddress}</div>
        </div>
        <Button
          className="bg-white text-[#0B0D14] border border-[#E6E8EE] dark:bg-[#11131A] dark:text-[#E6E8EE] dark:border-[#252833]"
          onClick={() => router.push("/app/aliases")}
        >
          Back
        </Button>
      </div>

      <div className="mt-4 space-y-2 rounded-xl border border-[#E6E8EE] bg-white p-3 dark:border-[#252833] dark:bg-[#11131A]">
        <div className="text-sm font-medium">Update destination</div>
        <div className="flex gap-2">
          <Input value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} placeholder="Destination address" />
          <Button
            onClick={async () => {
              setError(null);
              const res = await fetch(`/api/aliases/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ destinationAddress }),
              });
              if (!res.ok) return setError("Failed to update alias");
              setAlias(await res.json());
            }}
          >
            Save
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <Button
          className="bg-white text-[#0B0D14] border border-[#E6E8EE] dark:bg-[#11131A] dark:text-[#E6E8EE] dark:border-[#252833]"
          onClick={async () => {
            setError(null);
            const res = await fetch(`/api/aliases/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ isEnabled: !alias.isEnabled }),
            });
            if (!res.ok) return setError("Failed to toggle alias");
            setAlias(await res.json());
          }}
        >
          {alias.isEnabled ? "Disable" : "Enable"}
        </Button>
        <Button
          className="bg-red-600 text-white dark:bg-red-600"
          onClick={async () => {
            if (!confirm("Delete this alias?")) return;
            setError(null);
            const res = await fetch(`/api/aliases/${id}`, { method: "DELETE" });
            if (!res.ok) return setError("Failed to delete alias");
            router.push("/app/aliases");
          }}
        >
          Delete alias
        </Button>
      </div>

      {error ? <div className="mt-3 text-sm text-red-600">{error}</div> : null}
    </Card>
  );
}

