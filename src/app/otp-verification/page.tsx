"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { AuthLayout } from "@/components/layout/auth-layout";

function OtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const purpose = (searchParams.get("purpose") || "VERIFY_EMAIL") as "VERIFY_EMAIL" | "RESET_PASSWORD" | "LOGIN_2FA";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthLayout title="Verify OTP" subtitle={`Enter the 6-digit code sent to ${email}`}>
      <div className="space-y-4">
        <Input placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} inputMode="numeric" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button
          className="w-full"
          onClick={async () => {
            try {
              await clientApi("/api/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ email, code, purpose }),
              });
              router.push("/login");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Verification failed");
            }
          }}
        >
          Verify
        </Button>
        <ButtonSecondary
          className="w-full"
          onClick={async () => {
            await clientApi("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email, purpose }) });
          }}
        >
          Resend code
        </ButtonSecondary>
        <Link href="/login" className="block text-center text-sm text-cyan-400 hover:underline">
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div className="zyoris-auth-bg flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">Loading…</div>}>
      <OtpForm />
    </Suspense>
  );
}
