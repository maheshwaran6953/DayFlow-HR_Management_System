import type * as React from "react";
import { AppShell } from "@/components/app-shell";
import { RequireAuth } from "@/components/guards";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

