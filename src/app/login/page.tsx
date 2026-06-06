"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout title="Sign in" subtitle="Access your organization mailboxes and admin controls.">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-[var(--muted)]">Work email</label>
          <Input placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-[var(--muted)]">Password</label>
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button
          className="w-full"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError(null);
            const res = await signIn("credentials", { email, password, redirect: false });
            setLoading(false);
            if (res?.error) setError("Invalid credentials or unverified account");
            else router.push("/app/inbox");
          }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>
        <div className="flex justify-between text-sm">
          <Link href="/forgot-password" className="text-cyan-400 hover:underline">
            Forgot password?
          </Link>
          <Link href="/signup" className="text-cyan-400 hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
