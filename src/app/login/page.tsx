"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <h1 className="text-2xl font-semibold">Sign in to Zyoris Mail</h1>
        <div className="mt-4 space-y-3">
          <Input placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            className="w-full"
            onClick={async () => {
              const res = await signIn("credentials", { email, password, redirect: false });
              if (res?.error) setError("Invalid credentials or unverified account");
              else router.push("/app/inbox");
            }}
          >
            Sign in
          </Button>
          <div className="flex justify-between text-sm">
            <Link href="/forgot-password" className="text-[var(--primary)]">
              Forgot password?
            </Link>
            <Link href="/signup" className="text-[var(--primary)]">
              Create account
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
