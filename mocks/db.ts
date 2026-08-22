import type {
  AttendanceRecord,
  AttendanceStatus,
  Employee,
  LeaveRequest,
  Role,
} from "@/types";
import { EMPLOYEES_SEED } from "./employees";
import { LEAVES_SEED } from "./leaves";
import { DOCUMENTS_SEED } from "./documents";
import { addDaysISO, dateTimeAt, isWeekend, todayISO } from "@/lib/date";

export interface UserAccount {
  id: string;
  email: string;
  password: string; // plain text is only acceptable because this is a mock
  role: Role;
  verified: boolean;
}

const USERS_SEED: UserAccount[] = [
  {
    id: "emp-001",
    email: "alice@dayflow.com",
    password: "Admin@1234",
    role: "admin",
    verified: true,
  },
  {
    id: "emp-002",
    email: "rahul@dayflow.com",
    password: "Emp@1234",
    role: "employee",
    verified: true,
  },
];

/** Generate weekday attendance for the previous `historyDays` days (not today). */
function generateHistory(employees: Employee[], historyDays: number): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = todayISO();
  let seq = 1;

  employees.forEach((emp, empIdx) => {
    for (let back = 1; back <= historyDays; back++) {
      const date = addDaysISO(today, -back);
      if (isWeekend(date)) continue;

      const roll = (back * 5 + empIdx * 3) % 11;
      let status: AttendanceStatus;
      let checkIn: string | null;
      let checkOut: string | null;

      if (roll === 2) {
        // half day: left early
        status = "half-day";
        checkIn = dateTimeAt(date, 9, (empIdx * 7) % 25);
        checkOut = dateTimeAt(date, 13, 30);
      } else if (roll === 5) {
        status = "absent";
        checkIn = null;
        checkOut = null;
      } else if (roll === 8) {
        status = "leave";
        checkIn = null;
        checkOut = null;
      } else {
        status = "present";
        checkIn = dateTimeAt(date, 9, (back + empIdx * 4) % 28);
        checkOut = dateTimeAt(date, 18, (back * 3) % 40);
      }

      records.push({
        id: `att-seed-${seq++}`,
        employeeId: emp.id,
        date,
        checkInAt: checkIn,
        checkOutAt: checkOut,
        status,
      });
    }
  });

  return records;
}

/** Today's pre-set records so the demo shows a lived-in dashboard. */
function generateToday(employees: Employee[]): AttendanceRecord[] {
  const today = todayISO();
  const records: AttendanceRecord[] = [];

  const rahul = employees.find((e) => e.id === "emp-002");
  if (rahul) {
    records.push({
      id: "att-today-002",
      employeeId: rahul.id,
      date: today,
      checkInAt: dateTimeAt(today, 9, 12),
      checkOutAt: null,
      status: "present",
    });
  }

  const priya = employees.find((e) => e.id === "emp-003");
  if (priya) {
    records.push({
      id: "att-today-003",
      employeeId: priya.id,
      date: today,
      checkInAt: null,
      checkOutAt: null,
      status: "leave",
    });
  }

  return records;
}

/**
 * In-memory database backing the mocked API. Mutations live for the
 * lifetime of the browser session and reset on a full page reload.
 */
class MockDb {
  employees: Employee[] = structuredClone(EMPLOYEES_SEED);
  users: UserAccount[] = structuredClone(USERS_SEED);
  attendance: AttendanceRecord[] = [
    ...generateHistory(this.employees, 27),
    ...generateToday(this.employees),
  ];
  leaves: LeaveRequest[] = structuredClone(LEAVES_SEED);
  documents = structuredClone(DOCUMENTS_SEED);

  private attendanceSeq = 1000;
  private leaveSeq = 1000;

  nextAttendanceId(): string {
    this.attendanceSeq += 1;
    return `att-${this.attendanceSeq}`;
  }

  nextLeaveId(): string {
    this.leaveSeq += 1;
    return `lv-${this.leaveSeq}`;
  }
}

// Survive HMR during development so mock edits are not wiped on re-render.
declare global {
  var __dayflowDb: MockDb | undefined;
}

export const db: MockDb = globalThis.__dayflowDb ?? new MockDb();
globalThis.__dayflowDb = db;
