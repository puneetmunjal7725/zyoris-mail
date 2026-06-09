"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { useToast } from "@/components/ui/toast-provider";

export default function DomainOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [domains, setDomains] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [step, setStep] = useState(1);
  const [verifying, setVerifying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const rows = await clientApi<any[]>("/api/domains");
        const custom = rows.filter((d) => d.domain !== "zyoris.com");
        setDomains(custom);
        const domainId = searchParams.get("domainId");
        const picked = domainId ? custom.find((d) => String(d._id) === domainId) : custom.find((d) => d.status !== "VERIFIED");
        setActive(picked || null);
        if (picked?.status === "VERIFIED") setStep(4);
        else if (picked) setStep(2);
      } catch (e) {
        toast(e instanceof Error ? e.message : "Failed to load domains", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams, toast]);

  async function verifyNow() {
    if (!active) return;
    setVerifying(true);
    try {
      const updated = await clientApi<any>(`/api/domains/${String(active._id)}/verify`, { method: "POST" });
      setActive(updated);
      if (updated.status === "VERIFIED") {
        toast("Domain verified successfully", "success");
        setStep(4);
      } else {
        toast("Verification record not found yet. DNS can take up to 48 hours.", "error");
        setStep(3);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : "Verification check failed", "error");
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="mt-6 p-6 text-sm text-[var(--muted)]">Loading domain setup…</Card>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold">Set up your domain</h1>
        <Card className="mt-6 space-y-4">
          <p className="text-sm text-[var(--muted)]">No custom domain found. Add one in Settings → Domains first.</p>
          <Button onClick={() => router.push("/app/settings/domains")}>Go to Domains</Button>
        </Card>
      </div>
    );
  }

  const instructions = active.verificationInstructions;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Set up {active.domain}</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Add the DNS record below, then verify ownership.</p>

      <Card className="mt-6 space-y-4">
        {step === 2 && (
          <>
            <h2 className="font-medium">Step 1 — Add verification record</h2>
            <p className="text-sm text-[var(--muted)]">At your domain registrar, add this TXT record on the root domain:</p>
            <div className="rounded-lg bg-[var(--secondary)] p-3 font-mono text-xs">
              <div>Host: @</div>
              <div>Value: zyoris-verification={active.verificationToken}</div>
            </div>
            {instructions?.txt && (
              <div className="rounded-lg bg-[var(--secondary)] p-3 font-mono text-xs">
                <div>Host: {instructions.txt.host}</div>
                <div>Value: {instructions.txt.value}</div>
              </div>
            )}
            <p className="text-xs text-[var(--muted)]">
              Full SPF, DKIM, DMARC, and MX records are in{" "}
              <Link href="/app/settings/domains/advanced" className="zyoris-link">
                Advanced DNS
              </Link>
              .
            </p>
            <Button onClick={() => setStep(3)}>I've added the record</Button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="font-medium">Step 2 — Verify ownership</h2>
            <p className="text-sm text-[var(--muted)]">We'll check for your TXT verification record.</p>
            {active.diagnostics?.txt && (
              <p className="text-xs text-[var(--muted)]">Last check: {active.diagnostics.txt}</p>
            )}
            <Button onClick={verifyNow} disabled={verifying}>
              {verifying ? "Checking…" : "Check verification now"}
            </Button>
            <Button className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]" onClick={() => router.push("/app/inbox")}>
              Skip for now — go to inbox
            </Button>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="font-medium">Domain verified</h2>
            <p className="text-sm text-[var(--muted)]">{active.domain} is ready. Create team emails in Settings → Team emails.</p>
            <Button onClick={() => router.push("/app/settings/team/create")}>Add team email</Button>
            <Button className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]" onClick={() => router.push("/app/inbox")}>
              Go to inbox
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
