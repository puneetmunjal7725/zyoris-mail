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
    <AuthLayout title="Create your account" subtitle="Start managing business email on your domain.">
      <div className="space-y-4">
        <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Organization name" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
        <Input placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <Input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button
          className="w-full"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              await clientApi("/api/auth/signup", {
                method: "POST",
                body: JSON.stringify({ name, organizationName, email, password }),
              });
              router.push(`/otp-verification?email=${encodeURIComponent(email)}&purpose=VERIFY_EMAIL`);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Signup failed");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Creating…" : "Create account"}
        </Button>
        <p className="text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="text-cyan-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
