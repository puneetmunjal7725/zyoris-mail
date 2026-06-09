"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SettingsShell } from "@/components/layout/settings-shell";
import { clientApi } from "@/lib/client-api";
import { useToast } from "@/components/ui/toast-provider";
import { domainValidationMessage } from "@/lib/domain-utils";

export default function SettingsDomainsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [domains, setDomains] = useState<any[]>([]);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  async function refresh() {
    setLoadingList(true);
    try {
      setDomains(await clientApi("/api/domains"));
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to load domains", "error");
      setDomains([]);
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") refresh();
  }, [status]);

  async function addDomain() {
    const validationError = domainValidationMessage(domain);
    if (validationError) {
      toast(validationError, "error");
      return;
    }

    const orgId = session?.user?.organizationId;
    if (!orgId) {
      toast("Session not ready. Please refresh the page.", "error");
      return;
    }

    setLoading(true);
    try {
      const created = await clientApi<any>("/api/domains", {
        method: "POST",
        body: JSON.stringify({ domain, organizationId: orgId }),
      });
      setDomain("");
      toast("Domain added successfully", "success");
      await refresh();
      router.push(`/app/onboarding/domain?domainId=${String(created._id)}`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Failed to add domain", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SettingsShell title="Domains">
      <Card>
        <p className="text-sm text-[var(--muted)]">Connect a domain your team will send email from.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            placeholder="yourcompany.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && addDomain()}
            className="max-w-sm"
            disabled={loading}
          />
          <Button onClick={addDomain} disabled={loading || status !== "authenticated"}>
            {loading ? "Adding…" : "Add domain"}
          </Button>
        </div>

        <div className="mt-6 space-y-2">
          {loadingList ? (
            <p className="text-sm text-[var(--muted)]">Loading domains…</p>
          ) : domains.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No domains connected yet.</p>
          ) : (
            domains.map((d) => (
              <div key={String(d._id)} className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                <div>
                  <div className="font-medium">{d.domain}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {d.status === "VERIFIED" ? "Ready to use" : d.status === "PENDING" ? "Setup in progress" : "Needs attention"}
                  </div>
                </div>
                {d.status !== "VERIFIED" && d.domain !== "zyoris.com" && (
                  <Link href={`/app/onboarding/domain?domainId=${String(d._id)}`} className="text-sm zyoris-link">
                    Continue setup
                  </Link>
                )}
              </div>
            ))
          )}
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
