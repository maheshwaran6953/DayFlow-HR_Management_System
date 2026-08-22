import type * as React from "react";

import { RedirectIfAuthenticated } from "@/components/guards";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RedirectIfAuthenticated>
      <div className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
              D
            </span>
            <div>
              <h1 className="font-heading text-2xl font-semibold tracking-tight">
                Dayflow
              </h1>
              <p className="text-sm text-muted-foreground">
                HRMS for attendance, leave and payroll
              </p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </RedirectIfAuthenticated>
  );
}
