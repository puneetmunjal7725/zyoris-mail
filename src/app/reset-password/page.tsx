"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { AuthLayout } from "@/components/layout/auth-layout";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthLayout title="Set new password" subtitle={`Enter the token from your email for ${searchParams.get("email")}`}>
      <div className="space-y-4">
        <Input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
        <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button
          className="w-full"
          onClick={async () => {
            try {
              await clientApi("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
              router.push("/login");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Reset failed");
            }
          }}
        >
          Update password
        </Button>
        <Link href="/login" className="block text-center text-sm text-cyan-400 hover:underline">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="zyoris-auth-bg flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">Loading…</div>}>
      <ResetForm />
    </Suspense>
  );
}
