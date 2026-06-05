"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <Card className="w-full">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Start managing business email on your domain.</p>
        <div className="mt-4 space-y-3">
          <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Organization name" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
          <Input placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
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
            Already have an account? <Link href="/login" className="text-[var(--primary)]">Sign in</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
