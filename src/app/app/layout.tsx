import { AppShell } from "@/components/layout/app-shell";
import { ComposeProvider } from "@/components/mail/compose-provider";
import { Suspense } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ComposeProvider>
      <Suspense fallback={<div className="p-4">Loading…</div>}>
        <AppShell>{children}</AppShell>
      </Suspense>
    </ComposeProvider>
  );
}
