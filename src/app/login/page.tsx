"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email: email.trim().toLowerCase(), password, redirect: false });
    setLoading(false);
    if (res?.error) {
      if (res.error.includes("EMAIL_NOT_VERIFIED")) {
        setError("Your email is not verified yet. Complete OTP verification first.");
        router.push(`/otp-verification?email=${encodeURIComponent(email.trim().toLowerCase())}&purpose=VERIFY_EMAIL`);
        return;
      }
      if (res.error.includes("Account temporarily locked")) {
        setError("Too many failed attempts. Try again in 15 minutes.");
        return;
      }
      setError("Invalid email or password.");
      return;
    }
    router.push("/app/inbox");
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage mailboxes, domains, and team delivery settings.">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Work email</label>
          <Input
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[#9ca3af]">Password</label>
          <Input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={(e) => e.key === "Enter" && !loading && handleLogin()}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <Button className="w-full py-2.5" disabled={loading || !email || !password} onClick={handleLogin}>
          {loading ? "Signing in…" : "Sign in to dashboard"}
        </Button>

        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-xs leading-relaxed text-[#9ca3af]">
          New here? Create an account, verify your email with the 6-digit OTP, then sign in.
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <Link href="/forgot-password" className="text-cyan-400 hover:underline">
            Forgot password?
          </Link>
          <Link href="/signup">
            <ButtonSecondary className="px-4 py-2">Create account</ButtonSecondary>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
