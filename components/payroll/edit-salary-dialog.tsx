"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ApiError, updateSalaryStructure } from "@/lib/api";
import { useSession } from "@/components/providers/session-provider";
import type { Employee, SalaryStructure } from "@/types";

const FIELDS: { key: keyof SalaryStructure; label: string }[] = [
  { key: "basic", label: "Basic" },
  { key: "hra", label: "HRA" },
  { key: "allowances", label: "Allowances" },
  { key: "deductions", label: "Deductions" },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface EditSalaryDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: Employee) => void;
}

/** Admin-only salary structure editor with a live net-pay preview. */
export function EditSalaryDialog({
  employee,
  open,
  onOpenChange,
  onSaved,
}: EditSalaryDialogProps) {
  const { session } = useSession();
  const [salary, setSalary] = React.useState<SalaryStructure>(employee.salary);
  const [busy, setBusy] = React.useState(false);

  const netPay =
    (Number(salary.basic) || 0) +
    (Number(salary.hra) || 0) +
    (Number(salary.allowances) || 0) -
    (Number(salary.deductions) || 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setBusy(true);
    try {
      const updated = await updateSalaryStructure(
        employee.id,
        session.user.role,
        salary,
      );
      toast.success("Salary structure updated.");
      onOpenChange(false);
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not save salary.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit salary structure</DialogTitle>
          <DialogDescription>
            {employee.name} · {employee.employeeCode}. Admin/HR only.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map((field) => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={`salary-${field.key}`}>{field.label}</Label>
                <Input
                  id={`salary-${field.key}`}
                  type="number"
                  min={0}
                  step={100}
                  value={String(salary[field.key])}
                  onChange={(e) =>
                    setSalary((s) => ({ ...s, [field.key]: Number(e.target.value) }))
                  }
                  required
                />
              </div>
            ))}
          </div>
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Net pay (monthly)</span>
            <span className="font-semibold">{formatCurrency(netPay)}</span>
          </div>
          <DialogFooter className="mt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
