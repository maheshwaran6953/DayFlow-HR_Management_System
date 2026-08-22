/**
 * In-App Notification State & Dispatch Helper
 */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

export function formatLeaveNotification(employeeName: string, status: 'APPROVED' | 'REJECTED'): AppNotification {
  const isApproved = status === 'APPROVED';
  return {
    id: `notif_${Date.now()}`,
    title: isApproved ? 'Leave Request Approved' : 'Leave Request Rejected',
    message: isApproved 
      ? `Your leave application has been approved by management.`
      : `Your leave application was reviewed and could not be approved at this time.`,
    type: isApproved ? 'SUCCESS' : 'WARNING',
    read: false,
    createdAt: new Date().toISOString(),
  };
}
