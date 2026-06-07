"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function KeyboardShortcuts({ onCompose }: { onCompose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      if (e.key === "c" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onCompose ? onCompose() : router.push("/app/compose");
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder="Search mail"]')?.focus();
      }
      if (e.key === "g") {
        const once = (ev: KeyboardEvent) => {
          if (ev.key === "i") router.push("/app/inbox");
          if (ev.key === "s") router.push("/app/sent");
          if (ev.key === "d") router.push("/app/drafts");
          if (ev.key === "a") router.push("/app/archive");
        };
        window.addEventListener("keydown", once, { once: true });
      }
    }
    if (pathname.startsWith("/app")) {
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [router, pathname, onCompose]);

  return null;
}
