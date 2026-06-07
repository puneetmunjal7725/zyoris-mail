"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ComposeWidget } from "@/components/mail/compose-widget";

type ComposeState = "closed" | "open" | "minimized" | "expanded";

type ComposeContextValue = {
  state: ComposeState;
  openCompose: () => void;
  closeCompose: () => void;
  minimizeCompose: () => void;
  expandCompose: () => void;
};

const ComposeContext = createContext<ComposeContextValue | null>(null);

export function ComposeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ComposeState>("closed");

  const openCompose = useCallback(() => setState("open"), []);
  const closeCompose = useCallback(() => setState("closed"), []);
  const minimizeCompose = useCallback(() => setState("minimized"), []);
  const expandCompose = useCallback(() => setState("expanded"), []);

  const value = useMemo(
    () => ({ state, openCompose, closeCompose, minimizeCompose, expandCompose }),
    [state, openCompose, closeCompose, minimizeCompose, expandCompose]
  );

  return (
    <ComposeContext.Provider value={value}>
      {children}
      {state !== "closed" && (
        <ComposeWidget
          minimized={state === "minimized"}
          expanded={state === "expanded"}
          onMinimize={minimizeCompose}
          onExpand={expandCompose}
          onClose={closeCompose}
        />
      )}
      {state === "closed" && (
        <button
          type="button"
          onClick={openCompose}
          className="fixed bottom-6 right-6 z-40 rounded-2xl bg-[var(--pastel-peach)] px-5 py-3 text-sm font-medium text-[var(--foreground)] shadow-md transition-colors hover:bg-[#f0c49a]"
        >
          Compose
        </button>
      )}
    </ComposeContext.Provider>
  );
}

export function useCompose() {
  const ctx = useContext(ComposeContext);
  if (!ctx) throw new Error("useCompose must be used within ComposeProvider");
  return ctx;
}
