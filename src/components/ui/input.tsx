import * as React from "react";
import { cn } from "@/lib/utils";
export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) { return <input className={cn("h-10 w-full rounded-xl border border-[#D8DCE8] bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#3A66F7] dark:border-[#2C3040]", className)} {...props} />; }
