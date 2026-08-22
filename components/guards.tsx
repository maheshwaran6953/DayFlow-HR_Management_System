"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";
import { useSession } from "@/components/providers/session-provider";
import type { Role } from "@/types";

function FullScreenSpinner() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

/** Redirects unauthenticated visitors to the sign-in page. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !session) router.replace("/sign-in");
  }, [isLoading, session, router]);

  if (isLoading || !session) return <FullScreenSpinner />;
  return <>{children}</>;
}

/**
 * Role guard for admin-only pages; employees are bounced to the dashboard.
 */
export function RequireRole({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { session, isLoading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading || !session) return;
    if (!roles.includes(session.user.role)) router.replace("/dashboard");
  }, [isLoading, session, roles, router]);

  if (isLoading || !session) return <FullScreenSpinner />;
  if (!roles.includes(session.user.role)) return <FullScreenSpinner />;
  return <>{children}</>;
}

/** Used on auth pages to send already-signed-in users to the dashboard. */
export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && session) router.replace("/dashboard");
  }, [isLoading, session, router]);

  if (isLoading || session) return <FullScreenSpinner />;
  return <>{children}</>;
}
