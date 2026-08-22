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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/components/providers/session-provider";
import { ApiError, applyLeave } from "@/lib/api";
import { todayISO } from "@/lib/date";
import type { LeaveRequest, LeaveType } from "@/types";

const LEAVE_TYPES: { value: LeaveType; label: string }[] = [
  { value: "paid", label: "Paid" },
  { value: "sick", label: "Sick" },
  { value: "unpaid", label: "Unpaid" },
];

interface ApplyLeaveDialogProps {
  onApplied: (created: LeaveRequest) => void;
}

export function ApplyLeaveDialog({ onApplied }: ApplyLeaveDialogProps) {
  const { session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<LeaveType>("paid");
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [remarks, setRemarks] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  function reset() {
    setType("paid");
    setFromDate("");
    setToDate("");
    setRemarks("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (!fromDate || !toDate || toDate < fromDate) {
      toast.error("Pick a valid date range.");
      return;
    }
    setBusy(true);
    try {
      const created = await applyLeave(session.user.id, {
        type,
        fromDate,
        toDate,
        remarks,
      });
      toast.success("Leave request submitted.");
      setOpen(false);
      reset();
      onApplied(created);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not submit request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) reset();
      }}
    >
      <DialogTrigger render={<Button>Apply for leave</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for leave</DialogTitle>
          <DialogDescription>Your request goes to Admin/HR for approval.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select<LeaveType>
              value={type}
              onValueChange={(v) => {
                if (v) setType(v);
              }}
              items={LEAVE_TYPES}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="leave-from">From</Label>
              <Input
                id="leave-from"
                type="date"
                min={todayISO()}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="leave-to">To</Label>
              <Input
                id="leave-to"
                type="date"
                min={fromDate || todayISO()}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="leave-remarks">Remarks</Label>
            <Textarea
              id="leave-remarks"
              placeholder="Reason / context (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="mt-1">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              Submit request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
