"use client";

import * as React from "react";
import { PencilIcon } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSession } from "@/components/providers/session-provider";
import { EditSalaryDialog, formatCurrency } from "./edit-salary-dialog";
import * as api from "@/lib/api";
import type { Employee, PayrollRow } from "@/types";

function netPayOf(s: { basic: number; hra: number; allowances: number; deductions: number }) {
  return s.basic + s.hra + s.allowances - s.deductions;
}

/** Read-only salary page for employees. */
function MyPayroll({ employeeId }: { employeeId: string }) {
  const [employee, setEmployee] = React.useState<Employee | null>(null);

  React.useEffect(() => {
    api.getEmployee(employeeId).then(setEmployee);
  }, [employeeId]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Payroll</h1>
        <p className="text-sm text-muted-foreground">
          Your salary structure. This page is read-only.
        </p>
      </div>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Monthly salary</CardTitle>
          <CardDescription>Contact HR for any corrections.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {!employee ? (
            <div className="flex flex-col gap-3 py-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-2/3" />
              ))}
            </div>
          ) : (
            <>
              {(
                [
                  ["Basic", employee.salary.basic],
                  ["HRA", employee.salary.hra],
                  ["Allowances", employee.salary.allowances],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium">{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Deductions</span>
                <span className="text-sm font-medium text-destructive">
                  − {formatCurrency(employee.salary.deductions)}
                </span>
              </div>
              <Separator className="my-1" />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Net pay</span>
                <span className="text-lg font-semibold">
                  {formatCurrency(netPayOf(employee.salary))}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** All employees + edit-salary dialog for admins. */
function TeamPayroll() {
  const [rows, setRows] = React.useState<PayrollRow[] | null>(null);
  const [editing, setEditing] = React.useState<PayrollRow | null>(null);

  const load = React.useCallback(() => {
    api.getPayrollRows().then(setRows);
  }, []);

  React.useEffect(load, [load]);

  function handleSaved() {
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Payroll</h1>
        <p className="text-sm text-muted-foreground">
          Salary structures for every employee. Monthly figures.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Salaries</CardTitle>
          <CardDescription>{rows ? `${rows.length} employees` : "Loading…"}</CardDescription>
        </CardHeader>
        <CardContent>
          {!rows ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="hidden lg:table-cell">Department</TableHead>
                  <TableHead className="text-right">Basic</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">HRA</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Allowances</TableHead>
                  <TableHead className="hidden text-right md:table-cell">Deductions</TableHead>
                  <TableHead className="text-right">Net pay</TableHead>
                  <TableHead className="text-right">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.employeeId}>
                    <TableCell>
                      <div className="font-medium">{row.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.employeeCode} · {row.designation}
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {row.department}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">{formatCurrency(row.salary.basic)}</TableCell>
                    <TableCell className="hidden text-right whitespace-nowrap sm:table-cell">{formatCurrency(row.salary.hra)}</TableCell>
                    <TableCell className="hidden text-right whitespace-nowrap sm:table-cell">{formatCurrency(row.salary.allowances)}</TableCell>
                    <TableCell className="hidden text-right whitespace-nowrap text-destructive md:table-cell">
                      − {formatCurrency(row.salary.deductions)}
                    </TableCell>
                    <TableCell className="text-right font-medium whitespace-nowrap">
                      {formatCurrency(row.netPay)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Edit salary for ${row.name}`}
                        onClick={() => setEditing(row)}
                      >
                        <PencilIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editing ? (
        <EditSalaryDialogBridge
          employeeId={editing.employeeId}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  );
}

/**
 * The shared salary dialog works on a full Employee object; fetch it when
 * the admin starts editing so the form is always in sync with the store.
 */
function EditSalaryDialogBridge({
  employeeId,
  onClose,
  onSaved,
}: {
  employeeId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [employee, setEmployee] = React.useState<Employee | null>(null);

  React.useEffect(() => {
    api.getEmployee(employeeId).then(setEmployee);
  }, [employeeId]);

  if (!employee) return null;

  return (
    <EditSalaryDialog
      employee={employee}
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onSaved={() => {
        onSaved();
      }}
    />
  );
}

export function PayrollView() {
  const { session } = useSession();
  if (!session) return null;
  return session.user.role === "admin" ? (
    <TeamPayroll />
  ) : (
    <MyPayroll employeeId={session.user.id} />
  );
}
