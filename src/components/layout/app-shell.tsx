"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
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

const workspaceItems = [
  ["/app/settings/team", "Team emails"],
  ["/app/settings", "Settings"],
  ["/app/billing", "Billing"],
] as const;

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = pathname === href || (href !== "/app/settings" && pathname.startsWith(`${href}/`)) || (href === "/app/settings" && pathname === "/app/settings");
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm transition-colors",
        active ? "zyoris-nav-active" : "text-[var(--foreground)] hover:bg-[var(--secondary)]"
      )}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { openCompose } = useCompose();
  const [search, setSearch] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setSearch(searchParams.get("q") || "");
  }, [searchParams]);

  const runSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("q", search);
    else params.delete("q");
    const base = pathname.startsWith("/app/inbox") || pathname.startsWith("/app/starred") || pathname.startsWith("/app/sent") ? pathname.split("?")[0] : "/app/inbox";
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
        <aside className="zyoris-sidebar flex w-[200px] shrink-0 flex-col border-r p-3">
          <ZyorisLogo href="/app/inbox" />
          <button
            type="button"
            onClick={openCompose}
            className="mt-4 w-full rounded-2xl bg-[var(--pastel-peach)] px-4 py-2.5 text-sm font-medium shadow-sm hover:opacity-90"
          >
            Compose
          </button>

          <div className="mt-3 space-y-0.5">
            {mailItems.map(([href, label]) => (
              <NavLink key={href} href={href} label={label} pathname={pathname} />
            ))}
          </div>

          <div className="my-3 border-t border-[var(--border)]" />

          <div className="space-y-0.5">
            {workspaceItems.map(([href, label]) => (
              <NavLink key={href} href={href} label={label} pathname={pathname} />
            ))}
            {session?.user?.role === "SUPER_ADMIN" && (
              <NavLink href="/app/admin" label="Platform" pathname={pathname} />
            )}
          </div>

          <div className="mt-auto border-t border-[var(--border)] pt-3">
            <div className="flex items-center gap-2 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pastel-blue)] text-xs font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{session?.user?.name || "User"}</div>
                <div className="truncate text-xs text-[var(--muted)]">{session?.user?.email}</div>
              </div>
            </div>
            <ButtonSecondary className="mt-2 w-full text-xs" onClick={() => signOut({ callbackUrl: "/login" })}>
              Sign out
            </ButtonSecondary>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {!pathname.startsWith("/app/settings") && !pathname.startsWith("/app/admin") && !pathname.startsWith("/app/billing") && !pathname.startsWith("/app/onboarding") && (
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
          )}
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
