"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompose } from "@/components/mail/compose-provider";

export default function ComposePage() {
  const router = useRouter();
  const { openCompose, expandCompose } = useCompose();

  useEffect(() => {
    openCompose();
    expandCompose();
    router.replace("/app/inbox");
  }, [openCompose, expandCompose, router]);

  return <div className="text-sm text-[var(--muted)]">Opening compose…</div>;
}
