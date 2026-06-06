"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button, ButtonSecondary } from "@/components/ui/button";
import { ZyorisLogo } from "@/components/brand/zyoris-logo";

const mailItems = [
  ["/app/inbox", "Inbox"],
  ["/app/sent", "Sent"],
  ["/app/drafts", "Drafts"],
  ["/app/starred", "Starred"],
  ["/app/spam", "Spam"],
  ["/app/trash", "Trash"],
  ["/app/compose", "Compose"],
] as const;

const orgItems = [
  ["/app/domains", "Domains"],
  ["/app/mailboxes", "Mailboxes"],
  ["/app/aliases", "Aliases"],
  ["/app/organization", "Organization"],
  ["/app/billing", "Billing"],
] as const;

const adminItems = [
  ["/app/admin", "Admin"],
  ["/app/admin/monitoring", "Monitoring"],
] as const;

function NavSection({ title, items, pathname }: { title: string; items: readonly (readonly [string, string])[]; pathname: string }) {
  return (
    <div className="mt-4">
      <div className="mb-2 px-3 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">{title}</div>
      <nav className="space-y-0.5">
        {items.map(([href, label]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all",
                active ? "zyoris-nav-active" : "text-[var(--muted)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              )}
            >
              <span>{label}</span>
              <span className="text-xs opacity-60">›</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const initials = (session?.user?.name || session?.user?.email || "U")
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[260px_1fr]">
        <aside className="zyoris-sidebar flex flex-col rounded-2xl p-4 shadow-lg">
          <ZyorisLogo href="/app/inbox" />
          <p className="mt-1 px-1 text-[0.65rem] uppercase tracking-[0.14em] text-[var(--muted)]">Business Email</p>

          <NavSection title="Mail" items={mailItems} pathname={pathname} />
          <NavSection title="Organization" items={orgItems} pathname={pathname} />
          {(session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "ORG_ADMIN") && (
            <NavSection title="Platform" items={adminItems} pathname={pathname} />
          )}

          <div className="mt-auto space-y-3 border-t border-[var(--border)] pt-4">
            <div className="flex items-center gap-2 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 text-xs font-semibold text-white">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{session?.user?.name || "User"}</div>
                <div className="truncate text-xs text-[var(--muted)]">{session?.user?.email}</div>
              </div>
            </div>
            <ButtonSecondary className="w-full" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </ButtonSecondary>
            <Button className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
              Logout
            </Button>
          </div>
        </aside>
        <main className="zyoris-content min-h-[calc(100vh-2rem)] rounded-2xl p-1 md:p-2">{children}</main>
      </div>
    </div>
  );
}
