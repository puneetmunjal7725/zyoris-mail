"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  ["/app/settings", "Overview"],
  ["/app/settings/team", "Team emails"],
  ["/app/settings/domains", "Domains"],
  ["/app/settings/aliases", "Aliases"],
  ["/app/settings/organization", "Organization"],
  ["/app/settings/domains/advanced", "Advanced DNS"],
] as const;

export function SettingsShell({ children, title }: { children: React.ReactNode; title: string }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">Manage your team, domains, and workspace preferences.</p>

      <nav className="mt-6 flex flex-wrap gap-2 border-b border-[var(--border)] pb-3">
        {items.map(([href, label]) => {
          const active = pathname === href || (href !== "/app/settings" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                active ? "bg-[var(--pastel-blue)] font-medium" : "text-[var(--muted)] hover:bg-[var(--secondary)]"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
