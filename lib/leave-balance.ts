/**
 * Leave Quota and Balance Calculator
 */

export interface LeaveQuota {
  casualLeave: { total: number; used: number; remaining: number };
  sickLeave: { total: number; used: number; remaining: number };
  paidLeave: { total: number; used: number; remaining: number };
  unpaidLeave: { used: number };
}

export function computeLeaveQuota(appliedLeaves: Array<{ type: string; days: number; status: string }>): LeaveQuota {
  const quota: LeaveQuota = {
    casualLeave: { total: 12, used: 0, remaining: 12 },
    sickLeave: { total: 8, used: 0, remaining: 8 },
    paidLeave: { total: 15, used: 0, remaining: 15 },
    unpaidLeave: { used: 0 },
  };

  for (const leave of appliedLeaves) {
    if (leave.status !== 'APPROVED') continue;

    if (leave.type === 'CASUAL') {
      quota.casualLeave.used += leave.days;
      quota.casualLeave.remaining = Math.max(0, quota.casualLeave.total - quota.casualLeave.used);
    } else if (leave.type === 'SICK') {
      quota.sickLeave.used += leave.days;
      quota.sickLeave.remaining = Math.max(0, quota.sickLeave.total - quota.sickLeave.used);
    } else if (leave.type === 'PAID') {
      quota.paidLeave.used += leave.days;
      quota.paidLeave.remaining = Math.max(0, quota.paidLeave.total - quota.paidLeave.used);
    } else if (leave.type === 'UNPAID') {
      quota.unpaidLeave.used += leave.days;
    }
  }

  return quota;
}
