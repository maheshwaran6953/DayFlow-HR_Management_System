export type Role = "admin" | "employee";

export type AttendanceStatus = "present" | "absent" | "half-day" | "leave";

export type LeaveType = "paid" | "sick" | "unpaid";

export type LeaveStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: Role;
}

export interface Session {
  user: User;
}

export interface PersonalDetails {
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
}

export type EmploymentType = "Full-time" | "Part-time" | "Contract";

export interface JobDetails {
  designation: string;
  department: string;
  employmentType: EmploymentType;
  joinedOn: string;
  reportingManager: string;
  workLocation: string;
}

export interface SalaryStructure {
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
  status: "Active" | "Probation";
  personal: PersonalDetails;
  job: JobDetails;
  salary: SalaryStructure;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD (local)
  checkInAt: string | null; // ISO datetime
  checkOutAt: string | null; // ISO datetime
  status: AttendanceStatus;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  remarks: string;
  status: LeaveStatus;
  reviewedBy: string | null;
  reviewComment: string | null;
  appliedAt: string; // ISO datetime
}

export type ActivityKind =
  | "leave"
  | "attendance"
  | "payroll"
  | "profile"
  | "general";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  message: string;
  at: string; // ISO datetime
}

// ---- API inputs / payloads ----

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  employeeCode: string;
  email: string;
  password: string;
  role: Role;
}

export interface SignUpResult {
  /** The account was created but must be verified before signing in. */
  requiresVerification: true;
  email: string;
}

export interface ApplyLeaveInput {
  type: LeaveType;
  fromDate: string;
  toDate: string;
  remarks: string;
}

export type LeaveDecision = Extract<LeaveStatus, "approved" | "rejected">;

export interface ReviewLeaveInput {
  decision: LeaveDecision;
  comment: string;
}

/** Fields an employee may change on their own profile. */
export interface ContactPatch {
  phone: string;
  address: string;
  avatarUrl: string;
}

/** Admin-only full profile patch; nested objects are merged shallowly. */
export interface ProfilePatch {
  name?: string;
  email?: string;
  avatarUrl?: string | null;
  personal?: Partial<PersonalDetails>;
  job?: Partial<JobDetails>;
  salary?: SalaryStructure;
}

export interface PayrollRow {
  employeeId: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  salary: SalaryStructure;
  netPay: number;
}

// ---- API Response Views (matching docs/API.md) ----

export interface SalaryView {
  id: string;
  profileId: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  effectiveFrom: string | Date;
  updatedAt: string | Date;
  profile?: {
    firstName: string;
    lastName: string;
    user?: {
      id: string;
      employeeId: string;
      email: string;
    } | null;
  } | null;
}

export interface ProfileView {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: string | null;
  position?: string | null;
  department?: string | null;
  joinedDate?: string | Date | null;
  profilePicture?: string | null;
  documents?: string | null;
  salary?: SalaryView | null;
}

export interface SessionUser {
  id: string;
  employeeId: string;
  email: string;
  role: string;
  createdAt?: string | Date;
  profile?: ProfileView | null;
}

export interface AttendanceRecordView {
  id: string;
  userId: string;
  date: string | Date;
  checkIn: string | Date | null;
  checkOut: string | Date | null;
  status: string;
  user?: {
    employeeId: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
}

export interface LeaveRequestView {
  id: string;
  userId: string;
  type: string;
  startDate: string | Date;
  endDate: string | Date;
  remarks?: string | null;
  status: string;
  reviewerId?: string | null;
  reviewComment?: string | null;
  reviewedAt?: string | Date | null;
  createdAt: string | Date;
  user?: {
    employeeId: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
  reviewer?: {
    employeeId: string;
    profile?: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
}

