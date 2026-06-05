import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="text-xl font-semibold">Zyoris Mail</div>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            Sign in
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-20">
        <section className="py-16 text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Business email on your domain</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--muted)]">
            Zyoris Mail helps teams run professional mailboxes like info@, sales@, and support@ with DNS verification, aliases, and enterprise controls.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/signup">
              <Button className="px-6 py-3 text-base">Start free</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] px-6 py-3 text-base">
                Sign in
              </Button>
            </Link>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["Custom domains", "Verify SPF, DKIM, DMARC, and MX with live DNS diagnostics."],
            ["Team mailboxes", "Create addresses, aliases, catch-all routing, and storage limits."],
            ["Secure delivery", "Send and receive through Resend, Mailgun, or SMTP with audit logs."],
          ].map(([title, body]) => (
            <Card key={title}>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{body}</p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
