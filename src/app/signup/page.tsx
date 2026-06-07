"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { clientApi } from "@/lib/client-api";
import { AuthLayout } from "@/components/layout/auth-layout";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailType, setEmailType] = useState<"zyoris" | "custom">("zyoris");
  const [organizationName, setOrganizationName] = useState("");
  const [zyorisUsername, setZyorisUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const previewEmail = zyorisUsername ? `${zyorisUsername.toLowerCase()}@zyoris.com` : "you@zyoris.com";

  async function finishSignup() {
    setLoading(true);
    setError(null);
    try {
      const data = await clientApi<{
        readyForInbox?: boolean;
        mailboxAddress?: string;
        verificationOtp?: string;
        emailSent?: boolean;
        emailType?: string;
      }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          name,
          email: email.trim().toLowerCase(),
          password,
          emailType,
          zyorisUsername: emailType === "zyoris" ? zyorisUsername.toLowerCase() : undefined,
          organizationName: emailType === "custom" ? organizationName : undefined,
        }),
      });

      if (data.readyForInbox) {
        const res = await signIn("credentials", {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });
        if (res?.error) {
          setError("Account created but sign-in failed. Please log in manually.");
          router.push("/login");
          return;
        }
        router.push("/app/inbox");
        return;
      }

      const normalized = email.trim().toLowerCase();
      if (data.verificationOtp) sessionStorage.setItem("zyoris_signup_otp", data.verificationOtp);
      router.push(
        `/otp-verification?email=${encodeURIComponent(normalized)}&purpose=VERIFY_EMAIL&emailSent=${data.emailSent ? "1" : "0"}&next=onboarding`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title={step === 1 ? "Create your account" : "Choose your email"}
      subtitle={step === 1 ? "Get started with Zyoris Mail in under a minute." : "Pick how you want to send and receive email."}
    >
      {step === 1 ? (
        <div className="space-y-4">
          <div>
            <label className="zyoris-label">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Puneet Kumar" />
          </div>
          <div>
            <label className="zyoris-label">Login email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" autoComplete="email" />
          </div>
          <div>
            <label className="zyoris-label">Password</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" autoComplete="new-password" />
          </div>
          <Button className="w-full" disabled={!name || !email || password.length < 8} onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3">
            <button
              type="button"
              onClick={() => setEmailType("zyoris")}
              className={`rounded-lg border p-4 text-left transition-colors ${emailType === "zyoris" ? "border-[var(--pastel-indigo)] bg-[var(--pastel-blue)]/30" : "border-[var(--border)] bg-[var(--card)]"}`}
            >
              <div className="font-medium">Use @zyoris.com</div>
              <div className="mt-1 text-sm text-[var(--muted)]">Instant mailbox — no DNS setup</div>
            </button>
            <button
              type="button"
              onClick={() => setEmailType("custom")}
              className={`rounded-lg border p-4 text-left transition-colors ${emailType === "custom" ? "border-[var(--pastel-indigo)] bg-[var(--pastel-blue)]/30" : "border-[var(--border)] bg-[var(--card)]"}`}
            >
              <div className="font-medium">Use your own domain</div>
              <div className="mt-1 text-sm text-[var(--muted)]">e.g. you@yourcompany.com — guided setup</div>
            </button>
          </div>

          {emailType === "zyoris" ? (
            <div>
              <label className="zyoris-label">Choose username</label>
              <Input
                value={zyorisUsername}
                onChange={(e) => setZyorisUsername(e.target.value.replace(/[^a-zA-Z0-9._-]/g, ""))}
                placeholder="puneet"
              />
              <p className="mt-2 text-sm text-[var(--muted)]">
                Your email: <strong>{previewEmail}</strong>
              </p>
            </div>
          ) : (
            <div>
              <label className="zyoris-label">Organization name</label>
              <Input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} placeholder="Acme Inc." />
            </div>
          )}

          {error && <div className="zyoris-error">{error}</div>}

          <div className="flex gap-2">
            <ButtonSecondary className="flex-1" onClick={() => setStep(1)}>
              Back
            </ButtonSecondary>
            <Button
              className="flex-1"
              disabled={loading || (emailType === "zyoris" ? !zyorisUsername : !organizationName)}
              onClick={finishSignup}
            >
              {loading ? "Creating…" : emailType === "zyoris" ? "Open my inbox" : "Create account"}
            </Button>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-sm text-[var(--muted)]">
        Already have an account? <Link href="/login" className="zyoris-link">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
