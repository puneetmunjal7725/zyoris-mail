"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ButtonSecondary } from "@/components/ui/button";
import { ZyorisLogo } from "@/components/brand/zyoris-logo";
import { KeyboardShortcuts } from "@/components/mail/keyboard-shortcuts";
import { useCompose } from "@/components/mail/compose-provider";

const mailItems = [
  ["/app/inbox", "Inbox"],
  ["/app/starred", "Starred"],
  ["/app/sent", "Sent"],
  ["/app/drafts", "Drafts"],
  ["/app/archive", "Archive"],
  ["/app/spam", "Spam"],
  ["/app/trash", "Trash"],
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
    <div className="mt-2">
      <div className="mb-1 px-2 text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--muted)]">{title}</div>
      <nav className="space-y-0.5">
        {items.map(([href, label]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "zyoris-nav-active" : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { openCompose } = useCompose();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const runSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("q", search);
    else params.delete("q");
    const base = pathname.startsWith("/app/") ? pathname : "/app/inbox";
    router.push(`${base}?${params.toString()}`);
  }, [search, searchParams, pathname, router]);

  const initials = (session?.user?.name || session?.user?.email || "U")
    .split(" ")
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <KeyboardShortcuts onCompose={openCompose} />
      <div className="flex min-h-screen">
        <aside className="zyoris-sidebar flex w-[220px] shrink-0 flex-col border-r p-3">
          <ZyorisLogo href="/app/inbox" />
          <button
            type="button"
            onClick={openCompose}
            className="mt-4 w-full rounded-2xl bg-[var(--pastel-peach)] px-4 py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-[#f0c49a]"
          >
            Compose
          </button>

          <NavSection title="Mail" items={mailItems} pathname={pathname} />
          <NavSection title="Manage" items={orgItems} pathname={pathname} />
          {session?.user?.role === "SUPER_ADMIN" && (
            <NavSection title="Platform" items={adminItems} pathname={pathname} />
          )}

          <div className="mt-auto space-y-2 border-t border-[var(--border)] pt-3">
            <div className="flex items-center gap-2 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pastel-blue)] text-xs font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{session?.user?.name || "User"}</div>
                <div className="truncate text-xs text-[var(--muted)]">{session?.user?.email}</div>
              </div>
            </div>
            <ButtonSecondary className="w-full text-xs" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? "Light" : "Dark"}
            </ButtonSecondary>
            <ButtonSecondary className="w-full text-xs" onClick={() => signOut({ callbackUrl: "/login" })}>
              Sign out
            </ButtonSecondary>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--card)] px-4 py-3">
            <div className="zyoris-search-bar flex flex-1 items-center gap-2 px-4 py-2">
              <span className="text-[var(--muted)]">⌕</span>
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                placeholder="Search mail"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
              />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
