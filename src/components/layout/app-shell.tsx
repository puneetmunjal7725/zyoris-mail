"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const items = [
  ["/app/inbox", "Inbox"],
  ["/app/sent", "Sent"],
  ["/app/drafts", "Drafts"],
  ["/app/trash", "Trash"],
  ["/app/spam", "Spam"],
  ["/app/starred", "Starred"],
  ["/app/compose", "Compose"],
  ["/app/domains", "Domains"],
  ["/app/mailboxes", "Mailboxes"],
  ["/app/aliases", "Aliases"],
  ["/app/organization", "Organization"],
  ["/app/billing", "Billing"],
  ["/app/admin", "Admin"],
  ["/app/admin/monitoring", "Monitoring"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
          <div className="mb-4">
            <div className="text-lg font-semibold">Zyoris Mail</div>
            <div className="mt-1 truncate text-xs text-[var(--muted)]">{session?.user?.email}</div>
          </div>
          <nav className="space-y-1">
            {items.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === href || pathname.startsWith(`${href}/`)
                    ? "bg-[var(--primary)] text-white"
                    : "hover:bg-[var(--accent)]"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 space-y-2 border-t border-[var(--border)] pt-4">
            <Button
              className="w-full bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)]"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </Button>
            <Button className="w-full" onClick={() => signOut({ callbackUrl: "/login" })}>
              Logout
            </Button>
          </div>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
