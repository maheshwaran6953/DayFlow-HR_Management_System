/**
 * Audit Trail and Activity Logger Utility
 */

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorEmail: string;
  action: 'LEAVE_APPROVED' | 'LEAVE_REJECTED' | 'SALARY_UPDATED' | 'PROFILE_EDITED' | 'CHECK_IN' | 'CHECK_OUT';
  targetEmployeeId?: string;
  details?: Record<string, unknown>;
}

export function createAuditLog(
  actorId: string,
  actorEmail: string,
  action: AuditLogEntry['action'],
  targetEmployeeId?: string,
  details?: Record<string, unknown>
): AuditLogEntry {
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    actorId,
    actorEmail,
    action,
    targetEmployeeId,
    details,
  };
}
