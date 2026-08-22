const DAY_MS = 24 * 60 * 60 * 1000;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Format a Date as a local YYYY-MM-DD string. */
export function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(): string {
  return isoDate(new Date());
}

/** Parse YYYY-MM-DD as local midnight. */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

export function addDaysISO(iso: string, n: number): string {
  return isoDate(addDays(parseISODate(iso), n));
}

/** Monday-based start of week. */
export function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

/** ISO dates Monday..Sunday for the week containing `iso`. */
export function weekDates(iso: string): string[] {
  const monday = startOfWeek(parseISODate(iso));
  return Array.from({ length: 7 }, (_, i) => isoDate(addDays(monday, i)));
}

export function isWeekend(iso: string): boolean {
  const day = parseISODate(iso).getDay();
  return day === 0 || day === 6;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "Mon" */
export function formatDayShort(iso: string): string {
  return DAY_NAMES[parseISODate(iso).getDay()] ?? "";
}

/** "Aug 22" */
export function formatDate(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Mon, Aug 22" */
export function formatDayAndDate(iso: string): string {
  return `${formatDayShort(iso)}, ${formatDate(iso)}`;
}

/** "Aug 22, 2026" */
export function formatDateFull(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** "09:05 AM" from an ISO datetime string. */
export function formatTime(dtIso: string): string {
  const d = new Date(dtIso);
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${pad(h)}:${m} ${ampm}`;
}

/** "Aug 22, 09:05 AM" */
export function formatDateTime(dtIso: string): string {
  const d = new Date(dtIso);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${formatTime(dtIso)}`;
}

/** Decimal hours between two ISO datetimes (>= 0). */
export function hoursBetween(fromIso: string, toIso: string): number {
  const ms = Math.max(0, new Date(toIso).getTime() - new Date(fromIso).getTime());
  return Math.round((ms / (60 * 60 * 1000)) * 10) / 10;
}

/**
 * Build a local ISO datetime for a given date at HH:mm (24h),
 * used only by fixtures.
 */
export function dateTimeAt(dateISO: string, hh: number, mm: number): string {
  const d = parseISODate(dateISO);
  d.setHours(hh, mm, 0, 0);
  return d.toISOString();
}
