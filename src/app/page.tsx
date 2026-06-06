import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { ZyorisLogo } from "@/components/brand/zyoris-logo";

export default function HomePage() {
  return (
    <div className="zyoris-page-bg min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <ZyorisLogo />
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
            Sign in
          </Link>
          <Link href="/signup">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 pb-20">
        <section className="py-16 text-center md:py-24">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400/90">Zyoris Mail</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Business email on <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">your domain</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted)]">
            Professional mailboxes, DNS verification, aliases, and enterprise controls — built with the same design language as Zyoris.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/signup">
              <Button className="px-8 py-3 text-base">Start free</Button>
            </Link>
            <Link href="/login">
              <ButtonSecondary className="px-8 py-3 text-base">Sign in</ButtonSecondary>
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
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
