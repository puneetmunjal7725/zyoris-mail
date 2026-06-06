import { ZyorisLogo } from "@/components/brand/zyoris-logo";

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
    <div className="zyoris-auth-bg flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-6">
        <ZyorisLogo />
        <a
          href="https://zyoris.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          zyoris.com
        </a>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 items-center px-4 pb-16">
        <div className="zyoris-panel w-full p-6 md:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
