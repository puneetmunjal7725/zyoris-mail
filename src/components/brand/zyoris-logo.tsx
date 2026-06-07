import Link from "next/link";
import { cn } from "@/lib/utils";

export function ZyorisLogo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--pastel-indigo)] text-xs font-bold text-[var(--foreground)]">
        Z
      </span>
      <span className="text-sm font-semibold text-[var(--foreground)]">Zyoris</span>
      <span className="text-xs text-[var(--muted)]">Mail</span>
    </Link>
  );
}
