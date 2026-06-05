"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";

function OtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const purpose = (searchParams.get("purpose") || "VERIFY_EMAIL") as "VERIFY_EMAIL" | "RESET_PASSWORD" | "LOGIN_2FA";
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="w-full">
      <h1 className="text-xl font-semibold">Verify OTP</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Enter the 6-digit code sent to {email}</p>
      <div className="mt-4 space-y-3">
        <Input placeholder="123456" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
        {error && <p className="text-sm text-red-600">{error}</p>}
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
        <Button
          className="w-full bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]"
          onClick={async () => {
            await clientApi("/api/auth/send-otp", { method: "POST", body: JSON.stringify({ email, purpose }) });
          }}
        >
          Resend code
        </Button>
        <Link href="/login" className="block text-center text-sm text-[var(--primary)]">
          Back to login
        </Link>
      </div>
    </Card>
  );
}

export default function OTPPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Suspense>
        <OtpForm />
      </Suspense>
    </div>
  );
}
