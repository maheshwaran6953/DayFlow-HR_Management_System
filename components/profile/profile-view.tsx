"use client";

import * as React from "react";
import Link from "next/link";
import { PencilIcon, ShieldAlertIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/components/providers/session-provider";
import { EditContactDialog, EditJobDialog, EditPersonalDialog } from "./edit-dialogs";
import { EditSalaryDialog, formatCurrency } from "@/components/payroll/edit-salary-dialog";
import { formatDateFull } from "@/lib/date";
import * as api from "@/lib/api";
import type { Employee, EmployeeDocument } from "@/types";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium sm:text-right">{value}</span>
    </div>
  );
}

export function ProfileView({ employeeId }: { employeeId: string }) {
  const { session } = useSession();
  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [documents, setDocuments] = React.useState<EmployeeDocument[] | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  const [contactOpen, setContactOpen] = React.useState(false);
  const [personalOpen, setPersonalOpen] = React.useState(false);
  const [jobOpen, setJobOpen] = React.useState(false);
  const [salaryOpen, setSalaryOpen] = React.useState(false);

  const isAdmin = session?.user.role === "admin";
  const isSelf = session?.user.id === employeeId;

  const load = React.useCallback(() => {
    api
      .getEmployee(employeeId)
      .then(setEmployee)
      .catch(() => setNotFound(true));
    api.getDocuments(employeeId).then(setDocuments);
  }, [employeeId]);

  React.useEffect(load, [load]);

  if (!session) return null;

  if (!isAdmin && !isSelf) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="items-center pt-6 text-center">
          <ShieldAlertIcon className="size-8 text-destructive" />
          <CardTitle>Not authorized</CardTitle>
          <CardDescription>
            You can only view your own profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6 text-center">
          <Button render={<Link href={`/profile/${session.user.id}`} />}>
            Go to my profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (notFound || !employee) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const s = employee.salary;
  const netPay = s.basic + s.hra + s.allowances - s.deductions;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar size="lg" className="size-16">
            {employee.avatarUrl ? <AvatarImage src={employee.avatarUrl} alt={employee.name} /> : null}
            <AvatarFallback>{initialsOf(employee.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-heading text-xl font-semibold tracking-tight">
              {employee.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {employee.employeeCode} · {employee.job.designation} ·{" "}
              {employee.job.department}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant={isAdmin ? "default" : "secondary"}>
                {isAdmin ? "Admin / HR Officer" : "Employee"}
              </Badge>
              <Badge variant="outline">{employee.status}</Badge>
              <Badge variant="outline">{employee.job.workLocation}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {isSelf ? (
              <Button variant="outline" onClick={() => setContactOpen(true)}>
                <PencilIcon /> Edit contact info
              </Button>
            ) : null}
            {isAdmin ? (
              <>
                <Button variant="outline" onClick={() => setPersonalOpen(true)}>
                  <PencilIcon /> Personal
                </Button>
                <Button variant="outline" onClick={() => setJobOpen(true)}>
                  <PencilIcon /> Job
                </Button>
                <Button variant="outline" onClick={() => setSalaryOpen(true)}>
                  <PencilIcon /> Salary
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="salary">Salary</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal details</CardTitle>
              <CardDescription>
                {isSelf
                  ? "You can edit phone, address and picture yourself."
                  : "Contact HR for corrections."}
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <FieldRow label="Date of birth" value={formatDateFull(employee.personal.dateOfBirth)} />
              <FieldRow label="Gender" value={employee.personal.gender} />
              <FieldRow label="Phone" value={employee.personal.phone} />
              <FieldRow label="Address" value={employee.personal.address} />
              <FieldRow label="Email" value={employee.email} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Job details</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <FieldRow label="Designation" value={employee.job.designation} />
              <FieldRow label="Department" value={employee.job.department} />
              <FieldRow label="Employment type" value={employee.job.employmentType} />
              <FieldRow label="Joined on" value={formatDateFull(employee.job.joinedOn)} />
              <FieldRow label="Reporting manager" value={employee.job.reportingManager} />
              <FieldRow label="Work location" value={employee.job.workLocation} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salary" className="mt-4">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Salary structure</CardTitle>
              <CardDescription>
                {isAdmin ? "Monthly figures." : "Read-only. Contact HR for changes."}
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              <FieldRow label="Basic" value={formatCurrency(s.basic)} />
              <FieldRow label="HRA" value={formatCurrency(s.hra)} />
              <FieldRow label="Allowances" value={formatCurrency(s.allowances)} />
              <FieldRow label="Deductions" value={`− ${formatCurrency(s.deductions)}`} />
              <Separator className="my-1" />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Net pay (monthly)</span>
                <span className="text-base font-semibold">{formatCurrency(netPay)}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Records shared with you by HR.</CardDescription>
            </CardHeader>
            <CardContent>
              {documents === null ? (
                <div className="flex flex-col gap-2">
                  {[0, 1].map((i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
                </div>
              ) : documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents on file.</p>
              ) : (
                <ul className="divide-y">
                  {documents.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                      </div>
                      <span className="ml-4 whitespace-nowrap text-xs text-muted-foreground">
                        Uploaded {formatDateFull(doc.uploadedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isSelf && contactOpen ? (
        <EditContactDialog
          key={`contact-${employee.id}`}
          employee={employee}
          open
          onOpenChange={setContactOpen}
          onSaved={setEmployee}
        />
      ) : null}
      {isAdmin && personalOpen ? (
        <EditPersonalDialog
          key={`personal-${employee.id}`}
          employee={employee}
          open
          onOpenChange={setPersonalOpen}
          onSaved={setEmployee}
        />
      ) : null}
      {isAdmin && jobOpen ? (
        <EditJobDialog
          key={`job-${employee.id}`}
          employee={employee}
          open
          onOpenChange={setJobOpen}
          onSaved={setEmployee}
        />
      ) : null}
      {isAdmin && salaryOpen ? (
        <EditSalaryDialog
          key={`salary-${employee.id}`}
          employee={employee}
          open
          onOpenChange={setSalaryOpen}
          onSaved={setEmployee}
        />
      ) : null}
    </div>
  );
}
