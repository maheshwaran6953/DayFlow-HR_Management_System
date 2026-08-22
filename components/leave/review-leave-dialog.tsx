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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/components/providers/session-provider";
import { ApiError, reviewLeave } from "@/lib/api";
import { formatDate } from "@/lib/date";
import type { LeaveRequest } from "@/types";

interface ReviewLeaveDialogProps {
  leave: LeaveRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewed: (updated: LeaveRequest) => void;
}

/**
 * Admin approve/reject dialog. A comment is optional for approvals and
 * required for rejections.
 */
export function ReviewLeaveDialog({
  leave,
  open,
  onOpenChange,
  onReviewed,
}: ReviewLeaveDialogProps) {
  const { session } = useSession();
  const [comment, setComment] = React.useState(leave.reviewComment ?? "");
  const [busy, setBusy] = React.useState(false);

  async function submit(decision: "approved" | "rejected") {
    if (!session) return;
    if (decision === "rejected" && !comment.trim()) {
      toast.error("Add a comment when rejecting a request.");
      return;
    }
    setBusy(true);
    try {
      const updated = await reviewLeave(
        leave.id,
        session.user.id,
        session.user.role,
        { decision, comment },
      );
      toast.success(`Request ${decision}.`);
      onOpenChange(false);
      onReviewed(updated);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  const range = `${formatDate(leave.fromDate)} – ${formatDate(leave.toDate)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review leave request</DialogTitle>
          <DialogDescription>
            {leave.type} leave · {range}
            {leave.remarks ? ` — “${leave.remarks}”` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="review-comment">Comment (optional)</Label>
          <Textarea
            id="review-comment"
            placeholder="Visible to the employee…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter className="mt-2 gap-2">
          <Button variant="destructive" onClick={() => submit("rejected")} disabled={busy}>
            Reject
          </Button>
          <Button onClick={() => submit("approved")} disabled={busy}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
