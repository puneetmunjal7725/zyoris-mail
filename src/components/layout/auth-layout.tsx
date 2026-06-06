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
    <div className="min-h-screen bg-[#050816] text-[#e5e7eb]">
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r border-white/10 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />

          <div className="relative z-10">
            <ZyorisLogo href="/" />
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cyan-400/90">Central Intelligence · Mail</p>
          </div>

          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight">
              Professional email
              <span className="block bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                built for modern teams
              </span>
            </h1>
            <p className="max-w-md text-base leading-relaxed text-[#9ca3af]">
              Manage inboxes, domains, mailboxes, and delivery from one secure workspace — with the same visual language as Zyoris.
            </p>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[#d1d5db]">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.7)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex items-center gap-3 text-xs text-[#6b7280]">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">SOC-ready controls</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Multi-tenant</span>
            <Link href="https://zyoris.vercel.app" className="ml-auto text-cyan-400 hover:underline">
              zyoris.com →
            </Link>
          </div>
        </section>

        <section className="flex flex-col px-4 py-8 sm:px-8 lg:py-12">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <ZyorisLogo href="/" />
            <Link href="https://zyoris.vercel.app" className="text-xs text-[#9ca3af] hover:text-white">
              zyoris.com
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <div className="rounded-2xl border border-white/10 bg-[#0f172a]/95 p-6 shadow-[0_32px_70px_rgba(0,0,0,0.45)] sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
              {subtitle && <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">{subtitle}</p>}
              <div className="mt-6">{children}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
