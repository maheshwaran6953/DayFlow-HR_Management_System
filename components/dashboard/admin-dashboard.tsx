"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CalendarClockIcon, UsersIcon } from "lucide-react";
import { AttendanceBadge, LeaveStatusBadge } from "@/components/badges";
import { ReviewLeaveDialog } from "@/components/leave/review-leave-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/components/providers/session-provider";
import { formatTime, todayISO } from "@/lib/date";
import * as api from "@/lib/api";
import type { AttendanceRecord, Employee, LeaveRequest } from "@/types";

export function AdminDashboard() {
  const { session } = useSession();
  const router = useRouter();

  const [employees, setEmployees] = React.useState<Employee[] | null>(null);
  const [todayAttendance, setTodayAttendance] = React.useState<AttendanceRecord[]>([]);
  const [pendingLeaves, setPendingLeaves] = React.useState<LeaveRequest[]>([]);
  const [reviewing, setReviewing] = React.useState<LeaveRequest | null>(null);

  const today = todayISO();

  const load = React.useCallback(() => {
    api.getEmployees().then(setEmployees);
    api.getTeamAttendanceRange(today, today).then(setTodayAttendance);
    api.getLeaves({ status: "pending" }).then(setPendingLeaves);
  }, [today]);

  React.useEffect(load, [load]);

  if (!session) return null;

  const nameOf = (id: string) =>
    employees?.find((e) => e.id === id)?.name ?? `Employee ${id}`;

  const presentToday = todayAttendance.filter(
    (r) => r.status === "present" || r.status === "half-day",
  ).length;
  const onLeaveToday = todayAttendance.filter((r) => r.status === "leave").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            HR Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Employees, attendance and approvals at a glance.
          </p>
        </div>
        {/* Switch-between-employees control */}
        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap text-muted-foreground">
            View employee
          </span>
          <Select<string>
            items={(employees ?? []).map((emp) => ({ value: emp.id, label: emp.name }))}
            value={null}
            onValueChange={(id) => {
              if (!id) return;
              router.push(`/profile/${id}`);
            }}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Switch employee…" />
            </SelectTrigger>
            <SelectContent>
              {(employees ?? []).map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total employees</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UsersIcon className="size-5 text-muted-foreground" />
              {employees ? employees.length : <Skeleton className="h-7 w-10" />}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Present today</CardDescription>
            <CardTitle className="text-2xl">{presentToday}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {onLeaveToday} on leave
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Pending approvals</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarClockIcon className="size-5 text-muted-foreground" />
              {pendingLeaves.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Employee list */}
        <Card>
          <CardHeader>
            <CardTitle>Employee list</CardTitle>
            <CardDescription>Click a row to open the profile</CardDescription>
          </CardHeader>
          <CardContent>
            {!employees ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        <Link
                          href={`/profile/${emp.id}`}
                          className="font-medium hover:underline"
                        >
                          {emp.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {emp.employeeCode}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {emp.job.department}
                      </TableCell>
                      <TableCell>
                        <Badge variant={emp.status === "Active" ? "secondary" : "outline"}>
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" render={<Link href={`/profile/${emp.id}`} />}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Today attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance today</CardTitle>
              <CardDescription>
                {presentToday} present · {onLeaveToday} on leave ·{" "}
                {Math.max(0, (employees?.length ?? 0) - presentToday - onLeaveToday)} not
                checked in
              </CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm" render={<Link href="/attendance" />}>
                  Records <ArrowRightIcon />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {todayAttendance.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No attendance records yet today.
                </p>
              ) : (
                <ul className="flex flex-col divide-y">
                  {todayAttendance.map((rec) => (
                    <li key={rec.id} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium">{nameOf(rec.employeeId)}</span>
                      <span className="flex items-center gap-3">
                        <span className="hidden text-xs text-muted-foreground sm:inline">
                          {rec.checkInAt ? `In ${formatTime(rec.checkInAt)}` : "—"}
                          {rec.checkOutAt ? ` · Out ${formatTime(rec.checkOutAt)}` : ""}
                        </span>
                        <AttendanceBadge status={rec.status} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Leave approval queue */}
          <Card>
            <CardHeader>
              <CardTitle>Leave approval queue</CardTitle>
              <CardDescription>{pendingLeaves.length} awaiting review</CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm" render={<Link href="/leave" />}>
                  All requests <ArrowRightIcon />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {pendingLeaves.length === 0 ? (
                <p className="text-sm text-muted-foreground">Queue is clear.</p>
              ) : (
                <ul className="flex flex-col divide-y">
                  {pendingLeaves.map((leave) => (
                    <li key={leave.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {nameOf(leave.employeeId)}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {leave.type} · {leave.fromDate} → {leave.toDate}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <LeaveStatusBadge status={leave.status} />
                        <Button variant="outline" size="sm" onClick={() => setReviewing(leave)}>
                          Review
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {reviewing ? (
        <ReviewLeaveDialog
          leave={reviewing}
          open={true}
          onOpenChange={(open) => {
            if (!open) setReviewing(null);
          }}
          onReviewed={load}
        />
      ) : null}
    </div>
  );
}
