import Link from "next/link";
import { ZyorisLogo } from "@/components/brand/zyoris-logo";

const highlights = [
  "Custom domain mailboxes for your team",
  "DNS verification with live diagnostics",
  "Aliases, catch-all routing, and audit logs",
];

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="zyoris-auth-bg min-h-screen text-[var(--foreground)]">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <section className="hidden flex-col justify-between border-r border-[var(--border)] bg-[var(--secondary)] px-10 py-12 lg:flex">
          <div>
            <ZyorisLogo href="/" />
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">Business Email</p>
          </div>

          <div className="space-y-5">
            <h1 className="text-3xl font-semibold leading-tight tracking-tight">
              Professional email for modern teams
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Manage inboxes, domains, mailboxes, and delivery from one calm workspace.
            </p>
            <ul className="space-y-2.5">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--foreground)]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--pastel-sage)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1">Multi-tenant</span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1">Enterprise-ready</span>
            <Link href="https://zyoris.vercel.app" className="zyoris-link ml-auto">
              zyoris.com →
            </Link>
          </div>
        </section>

        <section className="flex flex-col px-4 py-8 sm:px-8 lg:py-12">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <ZyorisLogo href="/" />
            <Link href="https://zyoris.vercel.app" className="zyoris-link text-xs">
              zyoris.com
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <div className="zyoris-panel p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
              {subtitle && <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{subtitle}</p>}
              <div className="mt-6">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
