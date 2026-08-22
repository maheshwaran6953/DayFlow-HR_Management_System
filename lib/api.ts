import type {
  ActivityItem,
  ApplyLeaveInput,
  AttendanceRecord,
  ContactPatch,
  Employee,
  EmployeeDocument,
  LeaveRequest,
  LeaveStatus,
  PayrollRow,
  ProfilePatch,
  ReviewLeaveInput,
  Role,
  Session,
  SignInInput,
  SignUpInput,
  SignUpResult,
  SalaryStructure,
} from "@/types";
import { db } from "@/mocks/db";
import { todayISO } from "@/lib/date";
import { isPasswordValid } from "@/lib/password";

/**
 * The single gateway between UI and "the server". Today every function
 * reads/writes fixtures from mocks/; on integration day these bodies are
 * replaced with real HTTP calls without touching any component.
 */

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function delay(ms = 220): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireEmployee(employeeId: string): Employee {
  const employee = db.employees.find((e) => e.id === employeeId);
  if (!employee) throw new ApiError("Employee not found.");
  return employee;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signIn(input: SignInInput): Promise<Session> {
  await delay();
  const account = db.users.find(
    (u) => u.email.toLowerCase() === input.email.trim().toLowerCase(),
  );
  if (!account || account.password !== input.password) {
    throw new ApiError("Invalid email or password.");
  }
  if (!account.verified) {
    throw new ApiError("Please verify your email before signing in.");
  }
  const employee = requireEmployee(account.id);
  return {
    user: {
      id: employee.id,
      employeeCode: employee.employeeCode,
      name: employee.name,
      email: account.email,
      role: account.role,
    },
  };
}

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  await delay();
  const code = input.employeeCode.trim().toUpperCase();
  const employee = db.employees.find((e) => e.employeeCode === code);
  if (!employee) {
    throw new ApiError("Employee ID not found. Ask HR to confirm your record.");
  }
  if (db.users.some((u) => u.id === employee.id)) {
    throw new ApiError("An account already exists for this employee ID.");
  }
  if (db.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) {
    throw new ApiError("This email is already registered.");
  }
  if (!isPasswordValid(input.password)) {
    throw new ApiError("Password does not meet the security rules.");
  }
  db.users.push({
    id: employee.id,
    email: input.email.trim(),
    password: input.password,
    role: input.role,
    verified: false,
  });
  return { requiresVerification: true, email: input.email.trim() };
}

/** Mock of the "verify my email" link for the demo flow. */
export async function verifyEmail(email: string): Promise<void> {
  await delay();
  const account = db.users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!account) throw new ApiError("No pending account found for this email.");
  account.verified = true;
}

// ---------------------------------------------------------------------------
// Employees / profile
// ---------------------------------------------------------------------------

export async function getEmployees(): Promise<Employee[]> {
  await delay();
  return structuredClone(db.employees);
}

export async function getEmployee(employeeId: string): Promise<Employee> {
  await delay();
  return structuredClone(requireEmployee(employeeId));
}

export async function updateProfile(
  employeeId: string,
  patch: ProfilePatch,
): Promise<Employee> {
  await delay();
  const employee = requireEmployee(employeeId);
  if (patch.name !== undefined) employee.name = patch.name;
  if (patch.email !== undefined) employee.email = patch.email;
  if (patch.avatarUrl !== undefined) {
    employee.avatarUrl = patch.avatarUrl === "" ? null : patch.avatarUrl;
  }
  Object.assign(employee.personal, patch.personal ?? {});
  Object.assign(employee.job, patch.job ?? {});
  if (patch.salary) employee.salary = { ...patch.salary };
  return structuredClone(employee);
}

/**
 * Employee self-service edit: address/phone/picture only.
 * Kept as its own endpoint-shaped function so the backend can enforce
 * field-level permissions independently of updateProfile.
 */
export async function updateOwnContactInfo(
  employeeId: string,
  patch: ContactPatch,
): Promise<Employee> {
  await delay();
  const employee = requireEmployee(employeeId);
  employee.personal.phone = patch.phone;
  employee.personal.address = patch.address;
  employee.avatarUrl = patch.avatarUrl === "" ? null : patch.avatarUrl;
  return structuredClone(employee);
}

export async function getDocuments(employeeId: string): Promise<EmployeeDocument[]> {
  await delay();
  requireEmployee(employeeId);
  return structuredClone(db.documents[employeeId] ?? []);
}

export async function getRecentActivity(session: Session): Promise<ActivityItem[]> {
  await delay(120);
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

  if (session.user.role === "admin") {
    const pending = db.leaves.filter((l) => l.status === "pending").length;
    return [
      {
        id: "act-a1",
        kind: "leave",
        message: `${pending} leave request${pending === 1 ? "" : "s"} awaiting approval`,
        at: hoursAgo(1),
      },
      {
        id: "act-a2",
        kind: "profile",
        message: "David Souza joined Engineering (probation period)",
        at: hoursAgo(26),
      },
      {
        id: "act-a3",
        kind: "payroll",
        message: "Salary structures locked for this cycle",
        at: hoursAgo(50),
      },
      {
        id: "act-a4",
        kind: "attendance",
        message: "Last month attendance summary is ready for review",
        at: hoursAgo(74),
      },
    ];
  }

  const mine = db.leaves
    .filter((l) => l.employeeId === session.user.id)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
    .slice(0, 3)
    .map((l, i): ActivityItem => ({
      id: `act-${l.id}`,
      kind: "leave",
      message:
        l.status === "approved"
          ? `Your ${l.type} leave (${l.fromDate} to ${l.toDate}) was approved`
          : l.status === "rejected"
            ? `Your ${l.type} leave (${l.fromDate} to ${l.toDate}) was rejected`
            : `Your ${l.type} leave (${l.fromDate} to ${l.toDate}) is pending approval`,
      at: hoursAgo(i === 0 ? 2 : i * 30 + 5),
    }));

  return [
    ...mine,
    {
      id: "act-e9",
      kind: "payroll",
      message: "Payslip for last month is available",
      at: hoursAgo(49),
    },
    {
      id: "act-e10",
      kind: "attendance",
      message: "You completed 4 weeks of full attendance",
      at: hoursAgo(96),
    },
  ];
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

export async function getAttendanceRange(
  employeeId: string,
  fromDateIso: string,
  toDateIso: string,
): Promise<AttendanceRecord[]> {
  await delay(150);
  requireEmployee(employeeId);
  return db.attendance
    .filter((r) => r.employeeId === employeeId && r.date >= fromDateIso && r.date <= toDateIso)
    .map((r) => ({ ...r }));
}

export async function getTeamAttendanceRange(
  fromDateIso: string,
  toDateIso: string,
): Promise<AttendanceRecord[]> {
  await delay(180);
  return db.attendance
    .filter((r) => r.date >= fromDateIso && r.date <= toDateIso)
    .map((r) => ({ ...r }));
}

export async function checkIn(employeeId: string): Promise<AttendanceRecord> {
  await delay();
  requireEmployee(employeeId);
  const today = todayISO();
  const existing = db.attendance.find(
    (r) => r.employeeId === employeeId && r.date === today,
  );
  if (existing) {
    if (existing.checkInAt) throw new ApiError("You have already checked in today.");
    existing.checkInAt = new Date().toISOString();
    existing.status = "present";
    return { ...existing };
  }
  const record: AttendanceRecord = {
    id: db.nextAttendanceId(),
    employeeId,
    date: today,
    checkInAt: new Date().toISOString(),
    checkOutAt: null,
    status: "present",
  };
  db.attendance.push(record);
  return { ...record };
}

export async function checkOut(employeeId: string): Promise<AttendanceRecord> {
  await delay();
  requireEmployee(employeeId);
  const today = todayISO();
  const existing = db.attendance.find(
    (r) => r.employeeId === employeeId && r.date === today,
  );
  if (!existing?.checkInAt) throw new ApiError("Check in before checking out.");
  if (existing.checkOutAt) throw new ApiError("You have already checked out today.");
  existing.checkOutAt = new Date().toISOString();
  return { ...existing };
}

// ---------------------------------------------------------------------------
// Leaves
// ---------------------------------------------------------------------------

export interface LeaveFilter {
  employeeId?: string;
  status?: LeaveStatus;
}

export async function getLeaves(filter: LeaveFilter = {}): Promise<LeaveRequest[]> {
  await delay(160);
  return db.leaves
    .filter(
      (l) =>
        (filter.employeeId === undefined || l.employeeId === filter.employeeId) &&
        (filter.status === undefined || l.status === filter.status),
    )
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
    .map((l) => ({ ...l }));
}

export async function applyLeave(
  employeeId: string,
  input: ApplyLeaveInput,
): Promise<LeaveRequest> {
  await delay();
  requireEmployee(employeeId);
  if (!input.fromDate || !input.toDate) throw new ApiError("Pick both start and end dates.");
  if (input.toDate < input.fromDate) {
    throw new ApiError("End date cannot be before the start date.");
  }
  const overlaps = db.leaves.some(
    (l) =>
      l.employeeId === employeeId &&
      (l.status === "pending" || l.status === "approved") &&
      input.fromDate <= l.toDate &&
      input.toDate >= l.fromDate,
  );
  if (overlaps) {
    throw new ApiError("You already have a pending or approved leave in this range.");
  }
  const request: LeaveRequest = {
    id: db.nextLeaveId(),
    employeeId,
    type: input.type,
    fromDate: input.fromDate,
    toDate: input.toDate,
    remarks: input.remarks.trim(),
    status: "pending",
    reviewedBy: null,
    reviewComment: null,
    appliedAt: new Date().toISOString(),
  };
  db.leaves.push(request);
  return { ...request };
}

export async function reviewLeave(
  leaveId: string,
  reviewerId: string,
  reviewerRole: Role,
  input: ReviewLeaveInput,
): Promise<LeaveRequest> {
  await delay();
  if (reviewerRole !== "admin") throw new ApiError("Only Admin/HR can review leave requests.");
  const leave = db.leaves.find((l) => l.id === leaveId);
  if (!leave) throw new ApiError("Leave request not found.");
  if (leave.status !== "pending") {
    throw new ApiError(`This request has already been ${leave.status}.`);
  }
  leave.status = input.decision;
  leave.reviewComment = input.comment.trim() || null;
  leave.reviewedBy = requireEmployee(reviewerId).name;
  return { ...leave };
}

// ---------------------------------------------------------------------------
// Payroll
// ---------------------------------------------------------------------------

export async function getPayrollRows(): Promise<PayrollRow[]> {
  await delay(180);
  return db.employees.map((e): PayrollRow => ({
    employeeId: e.id,
    employeeCode: e.employeeCode,
    name: e.name,
    designation: e.job.designation,
    department: e.job.department,
    salary: { ...e.salary },
    netPay: e.salary.basic + e.salary.hra + e.salary.allowances - e.salary.deductions,
  }));
}

export async function updateSalaryStructure(
  employeeId: string,
  actorRole: Role,
  salary: SalaryStructure,
): Promise<Employee> {
  await delay();
  if (actorRole !== "admin") {
    throw new ApiError("Only Admin/HR can update salary structures.");
  }
  const employee = requireEmployee(employeeId);
  const fields: (keyof SalaryStructure)[] = ["basic", "hra", "allowances", "deductions"];
  for (const f of fields) {
    if (!Number.isFinite(salary[f]) || salary[f] < 0) {
      throw new ApiError("Amounts must be zero or positive numbers.");
    }
  }
  employee.salary = { ...salary };
  return structuredClone(employee);
}
