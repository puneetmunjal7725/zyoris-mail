"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <Card className="w-full">
      <h1 className="text-xl font-semibold">Set new password</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Enter the token from your email for {searchParams.get("email")}</p>
      <div className="mt-4 space-y-3">
        <Input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
        <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
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
        <Link href="/login" className="block text-center text-sm text-[var(--primary)]">
          Back to login
        </Link>
      </div>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Suspense>
        <ResetForm />
      </Suspense>
    </div>
  );
}
