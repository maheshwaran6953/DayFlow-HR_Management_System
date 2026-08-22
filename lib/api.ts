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

export async function handle(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (err: any) {
    if (err?.name === "ZodError" || err?.issues) {
      const first = err.issues?.[0];
      return Response.json(
        { error: `${first?.path?.join(".") || "input"}: ${first?.message}` },
        { status: 400 }
      );
    }
    if (err?.status && typeof err.status === "number") {
      return Response.json({ error: err.message }, { status: err.status });
    }
    console.error("[dayflow] unhandled API error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

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

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data && typeof data.error === "string" ? data.error : "Request failed";
    throw new ApiError(errorMsg);
  }

  return data as T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function signIn(input: SignInInput): Promise<Session> {
  const data = await fetchApi<{ user: { id: string; employeeId: string; email: string; role: string } }>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email: input.email, password: input.password }),
    }
  );

  try {
    const meData = await fetchApi<{ user: any }>("/api/auth/me");
    const u = meData.user;
    const name = u.profile ? `${u.profile.firstName} ${u.profile.lastName}`.trim() : u.email;
    return {
      user: {
        id: u.id,
        employeeCode: u.employeeId,
        name: name || u.email,
        email: u.email,
        role: u.role.toLowerCase() as Role,
      },
    };
  } catch {
    return {
      user: {
        id: data.user.id,
        employeeCode: data.user.employeeId,
        name: data.user.email,
        email: data.user.email,
        role: data.user.role.toLowerCase() as Role,
      },
    };
  }
}

export async function signUp(input: SignUpInput): Promise<SignUpResult> {
  const nameParts = input.email.split("@")[0].split(".");
  const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : input.employeeCode;
  const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : "Employee";

  const data = await fetchApi<{ message: string; user: { email: string } }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({
      employeeId: input.employeeCode,
      email: input.email,
      password: input.password,
      role: input.role.toUpperCase(),
      firstName,
      lastName,
    }),
  });

  return { requiresVerification: true, email: data.user.email };
}

/** Mock of the "verify my email" link for the demo flow. */
export async function verifyEmail(email: string): Promise<void> {
  // In real REST API flow, email verification happens via token link.
}

// ---------------------------------------------------------------------------
// Employees / profile
// ---------------------------------------------------------------------------

function mapUserProfileToEmployee(u: any): Employee {
  const p = u.profile || {};
  const firstName = p.firstName || "";
  const lastName = p.lastName || "";
  const name = `${firstName} ${lastName}`.trim() || u.email;

  return {
    id: u.id,
    employeeCode: u.employeeId,
    name,
    email: u.email,
    role: u.role.toLowerCase() as Role,
    avatarUrl: p.profilePicture || null,
    status: "Active",
    personal: {
      dateOfBirth: "",
      gender: "",
      phone: p.phone || "",
      address: p.address || "",
    },
    job: {
      designation: p.position || "Employee",
      department: p.department || "General",
      employmentType: "Full-time",
      joinedOn: p.joinedDate ? new Date(p.joinedDate).toISOString().split("T")[0] : "",
      reportingManager: "HR",
      workLocation: "Office",
    },
    salary: p.salary
      ? {
          basic: p.salary.baseSalary,
          hra: 0,
          allowances: p.salary.allowances,
          deductions: p.salary.deductions,
        }
      : { basic: 0, hra: 0, allowances: 0, deductions: 0 },
  };
}

export async function getEmployees(): Promise<Employee[]> {
  const data = await fetchApi<{ employees: any[] }>("/api/profiles");
  return data.employees.map(mapUserProfileToEmployee);
}

export async function getEmployee(employeeId: string): Promise<Employee> {
  const data = await fetchApi<{ user: any }>(`/api/profiles/${employeeId}`);
  return mapUserProfileToEmployee(data.user);
}

export async function updateProfile(
  employeeId: string,
  patch: ProfilePatch,
): Promise<Employee> {
  const body: Record<string, any> = {};
  if (patch.name) {
    const parts = patch.name.trim().split(" ");
    body.firstName = parts[0];
    if (parts.length > 1) body.lastName = parts.slice(1).join(" ");
  }
  if (patch.avatarUrl !== undefined) body.profilePicture = patch.avatarUrl || "";
  if (patch.personal?.phone !== undefined) body.phone = patch.personal.phone;
  if (patch.personal?.address !== undefined) body.address = patch.personal.address;
  if (patch.job?.designation !== undefined) body.position = patch.job.designation;
  if (patch.job?.department !== undefined) body.department = patch.job.department;

  await fetchApi(`/api/profiles/${employeeId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return getEmployee(employeeId);
}

export async function updateOwnContactInfo(
  employeeId: string,
  patch: ContactPatch,
): Promise<Employee> {
  await fetchApi(`/api/profiles/${employeeId}`, {
    method: "PATCH",
    body: JSON.stringify({
      phone: patch.phone,
      address: patch.address,
      profilePicture: patch.avatarUrl,
    }),
  });
  return getEmployee(employeeId);
}

export async function getDocuments(employeeId: string): Promise<EmployeeDocument[]> {
  try {
    const data = await fetchApi<{ user: any }>(`/api/profiles/${employeeId}`);
    const docsStr = data.user?.profile?.documents;
    if (!docsStr) return [];
    return JSON.parse(docsStr);
  } catch {
    return [];
  }
}

export async function getRecentActivity(session: Session): Promise<ActivityItem[]> {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

  if (session.user.role === "admin") {
    try {
      const leavesData = await fetchApi<{ requests: any[] }>("/api/leaves?status=PENDING");
      const pending = leavesData.requests.length;
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
          message: "Employee profile management system active",
          at: hoursAgo(26),
        },
        {
          id: "act-a3",
          kind: "payroll",
          message: "Payroll structure synced with database",
          at: hoursAgo(50),
        },
      ];
    } catch {
      return [];
    }
  }

  try {
    const leavesData = await fetchApi<{ requests: any[] }>("/api/leaves");
    return leavesData.requests
      .slice(0, 3)
      .map((l: any, i: number): ActivityItem => ({
        id: `act-${l.id}`,
        kind: "leave",
        message:
          l.status === "APPROVED"
            ? `Your ${l.type.toLowerCase()} leave was approved`
            : l.status === "REJECTED"
              ? `Your ${l.type.toLowerCase()} leave was rejected`
              : `Your ${l.type.toLowerCase()} leave is pending approval`,
        at: hoursAgo(i === 0 ? 2 : i * 30 + 5),
      }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

function mapAttendanceRecord(r: any): AttendanceRecord {
  return {
    id: r.id,
    employeeId: r.userId,
    date: typeof r.date === "string" ? r.date.split("T")[0] : new Date(r.date).toISOString().split("T")[0],
    checkInAt: r.checkIn ? new Date(r.checkIn).toISOString() : null,
    checkOutAt: r.checkOut ? new Date(r.checkOut).toISOString() : null,
    status: r.status.toLowerCase() as AttendanceStatus,
  };
}

export async function getAttendanceRange(
  employeeId: string,
  fromDateIso: string,
  toDateIso: string,
): Promise<AttendanceRecord[]> {
  const data = await fetchApi<{ records: any[] }>(
    `/api/attendance?userId=${encodeURIComponent(employeeId)}&view=weekly&date=${encodeURIComponent(fromDateIso)}`
  );
  return data.records.map(mapAttendanceRecord);
}

export async function getTeamAttendanceRange(
  fromDateIso: string,
  toDateIso: string,
): Promise<AttendanceRecord[]> {
  const data = await fetchApi<{ records: any[] }>(
    `/api/attendance?view=weekly&date=${encodeURIComponent(fromDateIso)}`
  );
  return data.records.map(mapAttendanceRecord);
}

export async function checkIn(employeeId: string): Promise<AttendanceRecord> {
  const data = await fetchApi<{ message: string; record: any }>("/api/attendance/check-in", {
    method: "POST",
  });
  return mapAttendanceRecord(data.record);
}

export async function checkOut(employeeId: string): Promise<AttendanceRecord> {
  const data = await fetchApi<{ message: string; record: any }>("/api/attendance/check-out", {
    method: "POST",
  });
  return mapAttendanceRecord(data.record);
}

// ---------------------------------------------------------------------------
// Leaves
// ---------------------------------------------------------------------------

export interface LeaveFilter {
  employeeId?: string;
  status?: LeaveStatus;
}

function mapLeaveRequest(r: any): LeaveRequest {
  const reviewerName = r.reviewer?.profile
    ? `${r.reviewer.profile.firstName} ${r.reviewer.profile.lastName}`.trim()
    : r.reviewerId || null;

  return {
    id: r.id,
    employeeId: r.userId,
    type: r.type.toLowerCase() as LeaveType,
    fromDate: typeof r.startDate === "string" ? r.startDate.split("T")[0] : new Date(r.startDate).toISOString().split("T")[0],
    toDate: typeof r.endDate === "string" ? r.endDate.split("T")[0] : new Date(r.endDate).toISOString().split("T")[0],
    remarks: r.remarks || "",
    status: r.status.toLowerCase() as LeaveStatus,
    reviewedBy: reviewerName,
    reviewComment: r.reviewComment || null,
    appliedAt: new Date(r.createdAt).toISOString(),
  };
}

export async function getLeaves(filter: LeaveFilter = {}): Promise<LeaveRequest[]> {
  const params = new URLSearchParams();
  if (filter.employeeId) params.set("userId", filter.employeeId);
  if (filter.status) params.set("status", filter.status);

  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await fetchApi<{ requests: any[] }>(`/api/leaves${query}`);
  return data.requests.map(mapLeaveRequest);
}

export async function applyLeave(
  employeeId: string,
  input: ApplyLeaveInput,
): Promise<LeaveRequest> {
  const data = await fetchApi<{ message: string; request: any }>("/api/leaves", {
    method: "POST",
    body: JSON.stringify({
      type: input.type.toUpperCase(),
      startDate: input.fromDate,
      endDate: input.toDate,
      remarks: input.remarks,
    }),
  });
  return mapLeaveRequest(data.request);
}

export async function reviewLeave(
  leaveId: string,
  reviewerId: string,
  reviewerRole: Role,
  input: ReviewLeaveInput,
): Promise<LeaveRequest> {
  const data = await fetchApi<{ message: string; request: any }>(`/api/leaves/${leaveId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: input.decision.toUpperCase(),
      reviewComment: input.comment,
    }),
  });
  return mapLeaveRequest(data.request);
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
