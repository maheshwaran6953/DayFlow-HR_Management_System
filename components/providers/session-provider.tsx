"use client";

import * as React from "react";
import type { Role, Session, SignInInput } from "@/types";
import { signIn as apiSignIn } from "@/lib/api";

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

  const fetchSession = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const u = data.user;
          const name = u.profile ? `${u.profile.firstName} ${u.profile.lastName}`.trim() : u.email;
          const userSession: Session = {
            user: {
              id: u.id,
              employeeCode: u.employeeId,
              name: name || u.email,
              email: u.email,
              role: u.role.toLowerCase() as Role,
            },
          };
          setSession(userSession);
          return userSession;
        }
      }
      setSession(null);
      return null;
    } catch {
      setSession(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  const signIn = React.useCallback(
    async (input: SignInInput) => {
      const next = await apiSignIn(input);
      const current = await fetchSession();
      const s = current || next;
      setSession(s);
      return s;
    },
    [fetchSession],
  );

  const signOut = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setSession(null);
    }
  }, []);

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
