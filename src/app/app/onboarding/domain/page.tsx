"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";

export default function DomainOnboardingPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<any[]>([]);
  const [step, setStep] = useState(1);

  useEffect(() => {
    clientApi<any[]>("/api/domains")
      .then((rows) => setDomains(rows.filter((d) => d.domain !== "zyoris.com")))
      .catch(() => setDomains([]));
  }, []);

  const pending = domains.find((d) => d.status !== "VERIFIED");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Set up your domain</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">A short guided setup — technical details are in Settings when you need them.</p>

      <Card className="mt-6">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-medium">Step 1 — Add your domain</h2>
            <p className="text-sm text-[var(--muted)]">
              {pending ? `We're setting up ${pending.domain}.` : "Add a domain in Settings → Domains if you haven't yet."}
            </p>
            <Button onClick={() => setStep(2)} disabled={!pending}>
              Continue
            </Button>
          </div>
        )}

        {step === 2 && pending && (
          <div className="space-y-4">
            <h2 className="font-medium">Step 2 — Verify ownership</h2>
            <p className="text-sm text-[var(--muted)]">
              Ask your IT admin to add a verification record, or open Advanced DNS in Settings for exact values.
            </p>
            <Button
              onClick={async () => {
                await clientApi(`/api/domains/${String(pending._id)}/verify`, { method: "POST" });
                const refreshed = await clientApi<any[]>("/api/domains");
                const updated = refreshed.find((d) => String(d._id) === String(pending._id));
                if (updated?.status === "VERIFIED") router.push("/app/inbox");
                else setStep(3);
              }}
            >
              I've added the record — check now
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-medium">Almost there</h2>
            <p className="text-sm text-[var(--muted)]">DNS can take up to 48 hours. You can use your inbox now and finish setup later in Settings.</p>
            <Button onClick={() => router.push("/app/inbox")}>Go to inbox</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
