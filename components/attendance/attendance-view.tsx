"use client";

import * as React from "react";
import { toast } from "sonner";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { AttendanceBadge } from "@/components/badges";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/components/providers/session-provider";
import {
  formatDayAndDate,
  formatDayShort,
  formatDate,
  hoursBetween,
  todayISO,
  weekDates,
} from "@/lib/date";
import * as api from "@/lib/api";
import type { AttendanceRecord, Employee } from "@/types";

function Hours({ record }: { record: AttendanceRecord | null }) {
  if (!record?.checkInAt || !record.checkOutAt) return <>—</>;
  return <>{hoursBetween(record.checkInAt, record.checkOutAt)} h</>;
}

/** Check-in / check-out panel for the signed-in user. */
function CheckInOutCard() {
  const { session } = useSession();
  const [record, setRecord] = React.useState<AttendanceRecord | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(() => {
    if (!session) return;
    api
      .getAttendanceRange(session.user.id, todayISO(), todayISO())
      .then((rows) => setRecord(rows[0] ?? null))
      .finally(() => setLoaded(true));
  }, [session]);

  React.useEffect(load, [load]);

  async function run(action: "in" | "out") {
    if (!session) return;
    setBusy(true);
    try {
      const next =
        action === "in"
          ? await api.checkIn(session.user.id)
          : await api.checkOut(session.user.id);
      toast.success(action === "in" ? "Checked in." : "Checked out. Have a good evening!");
      setRecord(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today</CardTitle>
        <CardDescription>
          {formatDayAndDate(todayISO())}
          {record?.checkInAt
            ? ` · Checked in at ${new Date(record.checkInAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : ""}
        </CardDescription>
        <CardAction>
          {record ? <AttendanceBadge status={record.status} /> : null}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        {!loaded ? (
          <Skeleton className="h-8 w-40" />
        ) : (
          <>
            <Button onClick={() => run("in")} disabled={busy || !!record?.checkInAt}>
              <LogInIcon /> Check in
            </Button>
            <Button
              variant="outline"
              onClick={() => run("out")}
              disabled={busy || !record?.checkInAt || !!record.checkOutAt}
            >
              <LogOutIcon /> Check out
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              In:{" "}
              <span className="font-medium text-foreground">
                {record?.checkInAt
                  ? new Date(record.checkInAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
              <span className="mx-2">·</span>
              Out:{" "}
              <span className="font-medium text-foreground">
                {record?.checkOutAt
                  ? new Date(record.checkOutAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
              <span className="mx-2">·</span>
              Worked: <Hours record={record} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function AttendanceView() {
  const { session } = useSession();
  const isAdmin = session?.user.role === "admin";

  const [date, setDate] = React.useState(todayISO());
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  // Admin scope for the weekly view; defaults to self.
  const [weeklyEmployeeId, setWeeklyEmployeeId] = React.useState<string>("");

  React.useEffect(() => {
    if (!isAdmin) return;
    api.getEmployees().then((rows) => {
      setEmployees(rows);
      setWeeklyEmployeeId((current) => current || session?.user.id || rows[0]?.id || "");
    });
  }, [isAdmin, session?.user.id]);

  if (!session) return null;

  const employeeItems = employees.map((emp) => ({ value: emp.id, label: emp.name }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Your own check-in plus records for the whole team."
            : "Check in, check out and review your records."}
        </p>
      </div>

      <CheckInOutCard />

      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily view</TabsTrigger>
          <TabsTrigger value="weekly">Weekly view</TabsTrigger>
        </TabsList>

        {/* ---------------- Daily ---------------- */}
        <TabsContent value="daily" className="mt-4 flex flex-col gap-4">
          <div className="flex max-w-xs flex-col gap-1.5">
            <Label htmlFor="attendance-date">Date</Label>
            <Input
              id="attendance-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {isAdmin ? (
            <DailyTeamTable date={date} />
          ) : (
            <DailySelfTable employeeId={session.user.id} date={date} />
          )}
        </TabsContent>

        {/* ---------------- Weekly ---------------- */}
        <TabsContent value="weekly" className="mt-4 flex flex-col gap-4">
          <div className="flex max-w-xs flex-col gap-1.5">
            <Label htmlFor="attendance-week-date">Any date in the week</Label>
            <Input
              id="attendance-week-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {isAdmin ? (
            <div className="flex max-w-xs flex-col gap-1.5">
              <Label>Employee</Label>
              <Select<string>
                value={weeklyEmployeeId || null}
                onValueChange={(v) => {
                  if (v) setWeeklyEmployeeId(v);
                }}
                items={employeeItems}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick an employee…" />
                </SelectTrigger>
                <SelectContent>
                  {employeeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {isAdmin && !weeklyEmployeeId ? (
            <p className="text-sm text-muted-foreground">Pick an employee to see their week.</p>
          ) : (
            <WeekGrid
              employeeId={isAdmin ? weeklyEmployeeId : session.user.id}
              anchorDate={date}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DailySelfTable({ employeeId, date }: { employeeId: string; date: string }) {
  const cacheKey = `${employeeId}|${date}`;
  const [state, setState] = React.useState<{
    key: string;
    rows: AttendanceRecord[];
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    api.getAttendanceRange(employeeId, date, date).then((rows) => {
      if (!cancelled) setState({ key: cacheKey, rows });
    });
    return () => {
      cancelled = true;
    };
  }, [employeeId, date, cacheKey]);

  const records = state?.key === cacheKey ? state.rows : null;
  const record = records?.[0] ?? null;

  return (
    <Card className="max-w-xl">
      <CardContent className="py-2">
        {records === null ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 py-2">
            <div>
              <p className="text-sm font-medium">{formatDayAndDate(date)}</p>
              <p className="text-xs text-muted-foreground">
                {record
                  ? `${record.checkInAt ? `In ${formatTimeStr(record.checkInAt)}` : "Not checked in"}${
                      record.checkOutAt ? ` · Out ${formatTimeStr(record.checkOutAt)}` : ""
                    }`
                  : "No record for this day (weekend or no data)."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Worked: <Hours record={record} />
              </span>
              {record ? (
                <AttendanceBadge status={record.status} />
              ) : (
                <span className="text-xs text-muted-foreground">No status</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Small helper kept local to avoid over-configurable components.
function formatTimeStr(dtIso: string): string {
  return new Date(dtIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function DailyTeamTable({ date }: { date: string }) {
  const [state, setState] = React.useState<{
    key: string;
    rows: AttendanceRecord[];
  } | null>(null);
  const [employees, setEmployees] = React.useState<Employee[]>([]);

  React.useEffect(() => {
    let cancelled = false;
    api.getTeamAttendanceRange(date, date).then((rows) => {
      if (!cancelled) setState({ key: date, rows });
    });
    return () => {
      cancelled = true;
    };
  }, [date]);

  React.useEffect(() => {
    api.getEmployees().then(setEmployees);
  }, []);

  const records = state?.key === date ? state.rows : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team records · {formatDayAndDate(date)}</CardTitle>
        <CardDescription>All employees</CardDescription>
      </CardHeader>
      <CardContent>
        {records === null ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check in</TableHead>
                <TableHead>Check out</TableHead>
                <TableHead className="text-right">Worked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((emp) => {
                const rec = records.find((r) => r.employeeId === emp.id) ?? null;
                return (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.employeeCode}</div>
                    </TableCell>
                    <TableCell>
                      {rec ? (
                        <AttendanceBadge status={rec.status} />
                      ) : (
                        <span className="text-xs text-muted-foreground">No record</span>
                      )}
                    </TableCell>
                    <TableCell>{rec?.checkInAt ? formatTimeStr(rec.checkInAt) : "—"}</TableCell>
                    <TableCell>{rec?.checkOutAt ? formatTimeStr(rec.checkOutAt) : "—"}</TableCell>
                    <TableCell className="text-right">
                      {rec?.checkInAt && rec.checkOutAt
                        ? `${hoursBetween(rec.checkInAt, rec.checkOutAt)} h`
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function WeekGrid({ employeeId, anchorDate }: { employeeId: string; anchorDate: string }) {
  const week = React.useMemo(() => weekDates(anchorDate), [anchorDate]);
  const cacheKey = `${employeeId}|${week[0] ?? ""}`;
  const [state, setState] = React.useState<{
    key: string;
    rows: AttendanceRecord[];
  } | null>(null);

  React.useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;
    api
      .getAttendanceRange(employeeId, week[0]!, week[week.length - 1]!)
      .then((rows) => {
        if (!cancelled) setState({ key: cacheKey, rows });
      });
    return () => {
      cancelled = true;
    };
  }, [employeeId, cacheKey, week]);

  const records = state?.key === cacheKey ? state.rows : null;

  return (
    <Card className="max-w-2xl">
      <CardContent>
        {records === null ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Day</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>In</TableHead>
                <TableHead>Out</TableHead>
                <TableHead className="text-right">Worked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {week.map((day) => {
                const rec =
                  records.find((r) => r.date === day) ?? null;
                const weekend = [0, 6].includes(new Date(`${day}T00:00:00`).getDay());
                return (
                  <TableRow key={day}>
                    <TableCell>
                      <span className="font-medium">{formatDayShort(day)}</span>{" "}
                      <span className="text-muted-foreground">{formatDate(day)}</span>
                      {day === todayISO() ? (
                        <Badge variant="secondary" className="ml-2">
                          Today
                        </Badge>
                      ) : null}
                      {weekend ? (
                        <span className="ml-2 text-xs text-muted-foreground">Weekend</span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {rec ? (
                        <AttendanceBadge status={rec.status} />
                      ) : weekend ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No record</span>
                      )}
                    </TableCell>
                    <TableCell>{rec?.checkInAt ? formatTimeStr(rec.checkInAt) : "—"}</TableCell>
                    <TableCell>{rec?.checkOutAt ? formatTimeStr(rec.checkOutAt) : "—"}</TableCell>
                    <TableCell className="text-right">
                      {rec?.checkInAt && rec.checkOutAt
                        ? `${hoursBetween(rec.checkInAt, rec.checkOutAt)} h`
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
