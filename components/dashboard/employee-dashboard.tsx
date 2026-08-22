"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  CircleUserRoundIcon,
  ClockIcon,
  InfoIcon,
  LogOutIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/components/providers/session-provider";
import { formatDateTime } from "@/lib/date";
import * as api from "@/lib/api";
import type { ActivityItem, LeaveRequest } from "@/types";

const QUICK_LINKS = [
  {
    label: "Attendance",
    description: "Check in and view records",
    href: "/attendance",
    icon: ClockIcon,
  },
  {
    label: "Leave Requests",
    description: "Apply and track leaves",
    href: "/leave",
    icon: CalendarDaysIcon,
  },
] as const;

export function EmployeeDashboard() {
  const { session, signOut } = useSession();
  const router = useRouter();
  const [activity, setActivity] = React.useState<ActivityItem[] | null>(null);
  const [leaves, setLeaves] = React.useState<LeaveRequest[]>([]);

  const employeeId = session?.user.id ?? "";

  React.useEffect(() => {
    let cancelled = false;
    if (!session) return;
    api.getRecentActivity(session).then((items) => {
      if (!cancelled) setActivity(items);
    });
    api.getLeaves({ employeeId }).then((rows) => {
      if (!cancelled) setLeaves(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [session, employeeId]);

  function handleLogout() {
    signOut();
    router.replace("/sign-in");
  }

  const pending = leaves.filter((l) => l.status === "pending");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Hello, {session?.user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is your quick access and latest updates.
        </p>
      </div>

      {pending.length > 0 ? (
        <Alert>
          <InfoIcon />
          <AlertTitle>Pending leave request</AlertTitle>
          <AlertDescription>
            You have {pending.length} pending request{pending.length > 1 ? "s" : ""}.
            Track progress under Leave Requests.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={`/profile/${employeeId}`} className="group">
          <Card size="sm" className="h-full transition-shadow group-hover:shadow-md">
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <CircleUserRoundIcon className="size-5 text-primary" />
              </span>
              <CardTitle className="mt-1">Profile</CardTitle>
              <CardDescription>View and edit your details</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        {QUICK_LINKS.map((link) => (
          <Link key={link.label} href={link.href} className="group">
            <Card size="sm" className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <link.icon className="size-5 text-primary" />
                </span>
                <CardTitle className="mt-1">{link.label}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
        <button onClick={handleLogout} className="text-left">
          <Card
            size="sm"
            className="h-full transition-shadow hover:shadow-md"
          >
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-lg bg-destructive/10">
                <LogOutIcon className="size-5 text-destructive" />
              </span>
              <CardTitle className="mt-1">Logout</CardTitle>
              <CardDescription>Sign out of Dayflow</CardDescription>
            </CardHeader>
          </Card>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Your latest updates and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          {activity === null ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing new right now.</p>
          ) : (
            <ul className="flex flex-col">
              {activity.map((item, i) => (
                <React.Fragment key={item.id}>
                  {i > 0 ? <Separator className="my-2.5" /> : null}
                  <li className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
                    <span className="text-sm">{item.message}</span>
                    <span className="text-xs whitespace-nowrap text-muted-foreground">
                      {formatDateTime(item.at)}
                    </span>
                  </li>
                </React.Fragment>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
