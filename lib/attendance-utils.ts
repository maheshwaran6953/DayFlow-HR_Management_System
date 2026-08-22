/**
 * Attendance and working hours helper utilities
 */

export interface WorkHoursSummary {
  hours: number;
  minutes: number;
  totalMinutes: number;
  formattedDuration: string;
  isOvertime: boolean;
  overtimeMinutes: number;
}

const STANDARD_WORK_DAY_MINUTES = 8 * 60; // 8 hours standard

export function calculateWorkHours(checkInTime: string | Date, checkOutTime: string | Date): WorkHoursSummary {
  const inDate = new Date(checkInTime);
  const outDate = new Date(checkOutTime);

  const diffMs = Math.max(0, outDate.getTime() - inDate.getTime());
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const isOvertime = totalMinutes > STANDARD_WORK_DAY_MINUTES;
  const overtimeMinutes = isOvertime ? totalMinutes - STANDARD_WORK_DAY_MINUTES : 0;

  return {
    hours,
    minutes,
    totalMinutes,
    formattedDuration: `${hours}h ${minutes}m`,
    isOvertime,
    overtimeMinutes,
  };
}

export function isWeekend(date: Date | string): boolean {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}
