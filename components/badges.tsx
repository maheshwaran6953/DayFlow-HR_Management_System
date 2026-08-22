import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AttendanceStatus, LeaveStatus } from "@/types";

const ATTENDANCE_STYLES: Record<AttendanceStatus, string> = {
  present: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "half-day": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  absent: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  leave: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
};

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  "half-day": "Half-day",
  leave: "Leave",
};

export function AttendanceBadge({
  status,
  className,
}: {
  status: AttendanceStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(ATTENDANCE_STYLES[status], className)}>
      {ATTENDANCE_LABELS[status]}
    </Badge>
  );
}

const LEAVE_STYLES: Record<LeaveStatus, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
};

const LEAVE_LABELS: Record<LeaveStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  return (
    <Badge variant="outline" className={LEAVE_STYLES[status]}>
      {LEAVE_LABELS[status]}
    </Badge>
  );
}
