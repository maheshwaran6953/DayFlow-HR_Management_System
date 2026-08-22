"use client";

import * as React from "react";
import type { Session, SignInInput } from "@/types";
import { signIn as apiSignIn } from "@/lib/api";

const STORAGE_KEY = "dayflow.session";

interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
  signIn: (input: SignInInput) => Promise<Session>;
  signOut: () => void;
}

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    // Resolve in a microtask so hydration isn't blocked by storage reads.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setSession(JSON.parse(raw) as Session);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = React.useCallback((next: Session | null) => {
    setSession(next);
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const signIn = React.useCallback(
    async (input: SignInInput) => {
      const next = await apiSignIn(input);
      persist(next);
      return next;
    },
    [persist],
  );

  const signOut = React.useCallback(() => {
    persist(null);
  }, [persist]);

  const value = React.useMemo(
    () => ({ session, isLoading, signIn, signOut }),
    [session, isLoading, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside <SessionProvider>");
  return ctx;
}
