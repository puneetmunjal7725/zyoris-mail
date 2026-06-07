"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";

export default function SettingsDomainsPage() {
  const { data: session } = useSession();
  const [domains, setDomains] = useState<any[]>([]);
  const [domain, setDomain] = useState("");

  async function refresh() {
    setDomains(await clientApi("/api/domains"));
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, []);

  return (
    <SettingsShell title="Domains">
      <Card>
        <p className="text-sm text-[var(--muted)]">Connect a domain your team will send email from.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input placeholder="yourcompany.com" value={domain} onChange={(e) => setDomain(e.target.value)} className="max-w-sm" />
          <Button
            onClick={async () => {
              if (!session?.user?.organizationId) return;
              await clientApi("/api/domains", {
                method: "POST",
                body: JSON.stringify({ domain, organizationId: session.user.organizationId }),
              });
              setDomain("");
              await refresh();
            }}
          >
            Add domain
          </Button>
        </div>

        <div className="mt-6 space-y-2">
          {domains.map((d) => (
            <div key={String(d._id)} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
              <div>
                <div className="font-medium">{d.domain}</div>
                <div className="text-xs text-[var(--muted)]">
                  {d.status === "VERIFIED" ? "Ready to use" : d.status === "PENDING" ? "Setup in progress" : "Needs attention"}
                </div>
              </div>
              {d.status !== "VERIFIED" && d.domain !== "zyoris.com" && (
                <Link href="/app/onboarding/domain" className="text-sm zyoris-link">
                  Continue setup
                </Link>
              )}
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-[var(--muted)]">
          Technical DNS records (SPF, DKIM, DMARC, MX) are in{" "}
          <Link href="/app/settings/domains/advanced" className="zyoris-link">
            Advanced DNS
          </Link>
          .
        </p>
      </Card>
    </SettingsShell>
  );
}
