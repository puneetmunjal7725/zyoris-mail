"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthLayout title="Reset password" subtitle="We will email you a reset token.">
      <div className="space-y-4">
        <div>
          <label className="zyoris-label">Email</label>
          <Input placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        {message && <div className="rounded-lg border border-[var(--pastel-sage)] bg-[var(--secondary)] px-3 py-2 text-sm">{message}</div>}
        {error && <div className="zyoris-error">{error}</div>}
        <Button
          className="w-full"
          onClick={async () => {
            try {
              await clientApi("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
              setMessage("If the account exists, a reset token was sent.");
              router.push(`/reset-password?email=${encodeURIComponent(email)}`);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Request failed");
            }
          }}
        >
          Send reset email
        </Button>
        <Link href="/login" className="block text-center text-sm zyoris-link">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
