"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SettingsShell } from "@/components/layout/settings-shell";

const links = [
  ["/app/settings/team", "Team emails", "Add and manage addresses for your team."],
  ["/app/settings/domains", "Domains", "Connect your company domain."],
  ["/app/settings/aliases", "Aliases", "Forward addresses to the right inbox."],
  ["/app/settings/organization", "Organization", "Team members and workspace details."],
  ["/app/billing", "Billing", "Plan usage and limits."],
] as const;

export default function SettingsPage() {
  return (
    <SettingsShell title="Settings">
      <div className="grid gap-3 md:grid-cols-2">
        {links.map(([href, title, desc]) => (
          <Link key={href} href={href}>
            <Card className="h-full transition-colors hover:bg-[var(--secondary)]">
              <h3 className="font-medium">{title}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </SettingsShell>
  );
}
