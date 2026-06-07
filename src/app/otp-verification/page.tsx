"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { AuthLayout } from "@/components/layout/auth-layout";

function OtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const purpose = (searchParams.get("purpose") || "VERIFY_EMAIL") as "VERIFY_EMAIL" | "RESET_PASSWORD" | "LOGIN_2FA";
  const emailSent = searchParams.get("emailSent") !== "0";
  const [code, setCode] = useState("");
  const [hintOtp, setHintOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("zyoris_signup_otp");
    if (stored) {
      setHintOtp(stored);
      setCode(stored);
    }
  }, []);

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={email ? `Enter the 6-digit code for ${email}` : "Enter your verification code to activate your account."}
    >
      <div className="space-y-4">
        {!emailSent && hintOtp && (
          <div className="rounded-lg border border-[var(--pastel-peach)] bg-[var(--secondary)] px-3 py-3 text-sm">
            Email delivery is not configured yet. Use this code: <strong>{hintOtp}</strong>
          </div>
        )}

        {emailSent && (
          <div className="rounded-lg border border-[var(--pastel-blue)] bg-[var(--secondary)] px-3 py-3 text-sm text-[var(--muted)]">
            We sent a 6-digit code to your inbox. It expires in 10 minutes.
          </div>
        )}

        <div>
          <label className="zyoris-label">Verification code</label>
          <Input
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
        </div>

        {error && <div className="zyoris-error">{error}</div>}
        {success && <div className="rounded-lg border border-[var(--pastel-sage)] bg-[var(--secondary)] px-3 py-2 text-sm">{success}</div>}

        <Button
          className="w-full"
          disabled={code.length !== 6}
          onClick={async () => {
            setError(null);
            try {
              await clientApi("/api/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ email, purpose, code }),
              });
              sessionStorage.removeItem("zyoris_signup_otp");
              sessionStorage.removeItem("zyoris_signup_otp");
              const next = searchParams.get("next");
              setSuccess(next === "onboarding" ? "Verified! Setting up your domain…" : "Email verified. You can sign in now.");
              setTimeout(() => router.push(next === "onboarding" ? "/app/onboarding/domain" : "/login"), 1200);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Verification failed");
            }
          }}
        >
          Verify email
        </Button>

        <ButtonSecondary
          className="w-full"
          onClick={async () => {
            try {
              await clientApi("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email, purpose }) });
              setSuccess("A new code was sent.");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not resend code");
            }
          }}
        >
          Resend code
        </ButtonSecondary>

        <Link href="/login" className="block text-center text-sm zyoris-link">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function OtpVerificationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[var(--muted)]">Loading…</div>}>
      <OtpForm />
    </Suspense>
  );
}
