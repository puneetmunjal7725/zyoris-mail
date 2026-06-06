import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "zyoris-panel rounded-2xl p-6",
        className
      )}
      {...props}
    />
  );
}
