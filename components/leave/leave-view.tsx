"use client";

import * as React from "react";
import { LeaveStatusBadge } from "@/components/badges";
import { ApplyLeaveDialog } from "./apply-leave-dialog";
import { ReviewLeaveDialog } from "./review-leave-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/components/providers/session-provider";
import * as api from "@/lib/api";
import type { Employee, LeaveRequest, LeaveStatus } from "@/types";

const FILTERS: { value: "all" | LeaveStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

function daysLabel(leave: LeaveRequest): string {
  return `${leave.fromDate} → ${leave.toDate}`;
}

export function LeaveView() {
  const { session } = useSession();
  const isAdmin = session?.user.role === "admin";

  const [leaves, setLeaves] = React.useState<LeaveRequest[] | null>(null);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [filter, setFilter] = React.useState<"all" | LeaveStatus>("all");
  const [reviewing, setReviewing] = React.useState<LeaveRequest | null>(null);

  const load = React.useCallback(() => {
    if (!session) return;
    api
      .getLeaves(isAdmin ? {} : { employeeId: session.user.id })
      .then(setLeaves);
  }, [session, isAdmin]);

  React.useEffect(load, [load]);

  React.useEffect(() => {
    if (!isAdmin) return;
    api.getEmployees().then(setEmployees);
  }, [isAdmin]);

  if (!session) return null;

  const nameOf = (id: string) =>
    employees.find((e) => e.id === id)?.name ?? "Unknown";

  const visible = (leaves ?? []).filter(
    (l) => filter === "all" || l.status === filter,
  );

  function handleReviewed(updated: LeaveRequest) {
    // Reflect the status change immediately in the open list.
    setLeaves((current) =>
      (current ?? []).map((l) => (l.id === updated.id ? updated : l)),
    );
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Leave Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Approve or reject team requests with comments."
              : "Apply for leave and track your requests."}
          </p>
        </div>
        {!isAdmin ? <ApplyLeaveDialog onApplied={handleReviewed} /> : null}
      </div>

      <Tabs
        value={filter}
        onValueChange={(v) => setFilter((v ?? "all") as "all" | LeaveStatus)}
      >
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f.value} value={f.value}>
              {f.label}
              {leaves && f.value !== "all" ? (
                <Badge variant="secondary" className="ml-1.5">
                  {leaves.filter((l) => l.status === f.value).length}
                </Badge>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent>
          {leaves === null ? (
            <div className="flex flex-col gap-2 py-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No leave requests here yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {isAdmin ? <TableHead>Employee</TableHead> : null}
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="hidden md:table-cell">Remarks</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin ? <TableHead className="text-right">Action</TableHead> : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((leave) => (
                  <TableRow key={leave.id}>
                    {isAdmin ? (
                      <TableCell className="font-medium">
                        {nameOf(leave.employeeId)}
                      </TableCell>
                    ) : null}
                    <TableCell className="capitalize">{leave.type}</TableCell>
                    <TableCell className="whitespace-nowrap">{daysLabel(leave)}</TableCell>
                    <TableCell className="hidden max-w-56 truncate text-muted-foreground md:table-cell">
                      {leave.remarks || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <LeaveStatusBadge status={leave.status} />
                        {leave.reviewComment ? (
                          <span className="max-w-48 truncate text-xs text-muted-foreground" title={`${leave.reviewedBy}: ${leave.reviewComment}`}>
                            “{leave.reviewComment}”
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    {isAdmin ? (
                      <TableCell className="text-right">
                        {leave.status === "pending" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReviewing(leave)}
                          >
                            Review
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {leave.reviewedBy ? `by ${leave.reviewedBy}` : ""}
                          </span>
                        )}
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {reviewing ? (
        <ReviewLeaveDialog
          leave={reviewing}
          open
          onOpenChange={(open) => {
            if (!open) setReviewing(null);
          }}
          onReviewed={handleReviewed}
        />
      ) : null}
    </div>
  );
}
