import Link from "next/link";
import { Card } from "@/components/ui/card";

async function getAliases() {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const res = await fetch(`${base}/api/aliases`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function AliasesPage() {
  const rows = await getAliases();
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Aliases</h2>
        <Link className="rounded-lg bg-[#3A66F7] px-3 py-2 text-sm text-white" href="/app/aliases/create">
          Create alias
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {rows.length === 0 ? (
          <p className="text-sm text-[#5A6175]">No aliases yet.</p>
        ) : (
          rows.map((a: any) => (
            <Link
              key={String(a._id)}
              href={`/app/aliases/${String(a._id)}`}
              className="block rounded-xl border border-[#E6E8EE] bg-white p-3 text-sm hover:bg-[#EEF2FF] dark:border-[#252833] dark:bg-[#11131A] dark:hover:bg-[#1A1F2D]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium">{a.sourceAddress}</div>
                  <div className="text-xs text-[#5A6175]">→ {a.destinationAddress}</div>
                </div>
                <div className="text-xs text-[#5A6175]">{a.isEnabled ? "Enabled" : "Disabled"}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}

