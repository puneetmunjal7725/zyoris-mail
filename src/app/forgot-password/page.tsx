"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">We will email you a reset token.</p>
        <div className="mt-4 space-y-3">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {message && <p className="text-sm text-green-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
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
          <Link href="/login" className="block text-center text-sm text-[var(--primary)]">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}
