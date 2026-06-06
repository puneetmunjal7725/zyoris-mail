"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <AuthLayout title="Create your workspace" subtitle="Set up your organization and verify your email to start using Zyoris Mail.">
      <div className="space-y-4">
        <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Organization name" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
        <Input placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Input type="password" placeholder="Password (min 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
        <Button
          className="w-full py-2.5"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const data = await clientApi<{
                emailSent?: boolean;
                verificationOtp?: string;
                message?: string;
              }>("/api/auth/signup", {
                method: "POST",
                body: JSON.stringify({ name, organizationName, email: email.trim().toLowerCase(), password }),
              });
              const normalized = email.trim().toLowerCase();
              if (data.verificationOtp) {
                sessionStorage.setItem("zyoris_signup_otp", data.verificationOtp);
              }
              router.push(
                `/otp-verification?email=${encodeURIComponent(normalized)}&purpose=VERIFY_EMAIL&emailSent=${data.emailSent ? "1" : "0"}`
              );
            } catch (e) {
              setError(e instanceof Error ? e.message : "Signup failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Creating account…" : "Create account & verify email"}
        </Button>
        <p className="text-center text-sm text-[#9ca3af]">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
