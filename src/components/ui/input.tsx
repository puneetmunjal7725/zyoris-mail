import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--input)] px-3 text-sm text-[var(--foreground)] outline-none transition-shadow placeholder:text-[var(--muted)] focus:border-[var(--ring)] focus:shadow-[0_0_0_1px_var(--ring)]",
        className
      )}
      {...props}
    />
  );
}
