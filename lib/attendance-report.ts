/**
 * Monthly Attendance Aggregation Report Generator
 */

export interface MonthlyAttendanceReport {
  totalCalendarDays: number;
  workingDays: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  leaveDays: number;
  attendancePercentage: number;
}

export function generateMonthlyAttendanceReport(
  records: Array<{ status: 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'LEAVE' }>,
  totalWorkingDays: number
): MonthlyAttendanceReport {
  let presentDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let leaveDays = 0;

  for (const record of records) {
    if (record.status === 'PRESENT') presentDays++;
    else if (record.status === 'HALF_DAY') halfDays++;
    else if (record.status === 'ABSENT') absentDays++;
    else if (record.status === 'LEAVE') leaveDays++;
  }

  const effectivePresent = presentDays + (halfDays * 0.5);
  const attendancePercentage = totalWorkingDays > 0 
    ? Math.round((effectivePresent / totalWorkingDays) * 100) 
    : 0;

  return {
    totalCalendarDays: 30,
    workingDays: totalWorkingDays,
    presentDays,
    halfDays,
    absentDays,
    leaveDays,
    attendancePercentage,
  };
}
