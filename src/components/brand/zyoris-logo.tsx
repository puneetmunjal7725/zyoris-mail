import Link from "next/link";
import { cn } from "@/lib/utils";

export function ZyorisLogo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
      </span>
      <span className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--foreground)]">Zyoris</span>
      <span className="text-xs font-medium text-[var(--muted)]">Mail</span>
    </Link>
  );
}
