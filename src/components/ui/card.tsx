import * as React from "react";
import { cn } from "@/lib/utils";
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-2xl border border-[#E6E8EE] bg-white p-6 shadow-sm dark:border-[#252833] dark:bg-[#11131A]", className)} {...props} />; }
