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
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-3 text-sm text-amber-100">
            Email delivery is not configured yet. Use this code: <strong className="text-white">{hintOtp}</strong>
          </div>
        )}

        {emailSent && (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-3 text-sm text-cyan-100">
            We sent a 6-digit code to your inbox. It expires in 10 minutes.
          </div>
        )}

        <Input
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          inputMode="numeric"
          className="text-center text-lg tracking-[0.4em]"
        />
        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{success}</div>}

        <Button
          className="w-full py-2.5"
          disabled={code.length !== 6}
          onClick={async () => {
            try {
              await clientApi("/api/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({ email, code, purpose }),
              });
              sessionStorage.removeItem("zyoris_signup_otp");
              setSuccess("Email verified! Redirecting to sign in…");
              setTimeout(() => router.push("/login"), 1200);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Verification failed");
            }
          }}
        >
          Verify & continue
        </Button>

        <ButtonSecondary
          className="w-full"
          onClick={async () => {
            try {
              const data = await clientApi<{ verificationOtp?: string; emailSent?: boolean }>("/api/auth/send-otp", {
                method: "POST",
                body: JSON.stringify({ email, purpose }),
              });
              if (data.verificationOtp) {
                setHintOtp(data.verificationOtp);
                setCode(data.verificationOtp);
              }
              setSuccess(data.emailSent ? "A new code was sent to your email." : "New code generated below.");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not resend code");
            }
          }}
        >
          Resend code
        </ButtonSecondary>

        <Link href="/login" className="block text-center text-sm text-cyan-400 hover:underline">
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#050816] text-sm text-[#9ca3af]">Loading…</div>}>
      <OtpForm />
    </Suspense>
  );
}
