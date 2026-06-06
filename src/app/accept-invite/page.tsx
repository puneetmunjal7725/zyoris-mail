"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { AuthLayout } from "@/components/layout/auth-layout";

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState(searchParams.get("token") || "");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthLayout title="Accept invitation" subtitle="Join your organization on Zyoris Mail.">
      <div className="space-y-4">
        <Input placeholder="Invitation token" value={token} onChange={(e) => setToken(e.target.value)} />
        <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button
          className="w-full"
          onClick={async () => {
            try {
              await clientApi("/api/invitations/accept", { method: "POST", body: JSON.stringify({ token, name, password }) });
              router.push("/login");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to accept invite");
            }
          }}
        >
          Join organization
        </Button>
      </div>
    </AuthLayout>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="zyoris-auth-bg flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">Loading…</div>}>
      <AcceptInviteForm />
    </Suspense>
  );
}
