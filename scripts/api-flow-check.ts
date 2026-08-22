/**
 * End-to-end flow checks against the mocked API layer (the exact functions
 * every component calls). Run with:  npx tsx scripts/api-flow-check.ts
 */
import {
  ApiError,
  applyLeave,
  checkIn,
  checkOut,
  getAttendanceRange,
  getDocuments,
  getEmployees,
  getLeaves,
  getPayrollRows,
  getTeamAttendanceRange,
  reviewLeave,
  signIn,
  signUp,
  updateOwnContactInfo,
  updateProfile,
  updateSalaryStructure,
  verifyEmail,
} from "../lib/api";
import { addDaysISO, todayISO } from "../lib/date";
import type { Session } from "../types";

let passed = 0;
const failures: string[] = [];

function ok(name: string, condition: boolean, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.error(`  FAIL ${name} ${detail}`);
  }
}

async function throws(name: string, fn: () => Promise<unknown>, match?: string) {
  try {
    await fn();
    ok(name, false, "expected ApiError but call succeeded");
  } catch (err) {
    const isApi = err instanceof ApiError;
    const msg = err instanceof Error ? err.message : String(err);
    ok(name, isApi && (!match || msg.includes(match)), msg);
  }
}

async function main() {
  console.log("Admin role:");
  let admin: Session | null = null;

  await throws("sign-in rejects wrong password", () =>
    signIn({ email: "alice@dayflow.com", password: "nope" }),
  );
  await throws("sign-in rejects unknown email", () =>
    signIn({ email: "ghost@dayflow.com", password: "x" }),
  );

  admin = await signIn({ email: "alice@dayflow.com", password: "Admin@1234" });
  ok("admin signs in", admin.user.role === "admin");

  const employees = await getEmployees();
  ok("employee roster has 5 seeded employees", employees.length === 5);

  const today = todayISO();
  const teamToday = await getTeamAttendanceRange(today, today);
  ok(
    "team attendance includes Rahul checked-in today",
    teamToday.some((r) => r.employeeId === "emp-002" && r.checkInAt && !r.checkOutAt),
  );
  ok(
    "team attendance marks Priya on leave",
    teamToday.some((r) => r.employeeId === "emp-003" && r.status === "leave"),
  );

  const pendingBefore = (await getLeaves({ status: "pending" })).length;
  ok("pending queue has seeded requests", pendingBefore >= 2);

  const reviewed = await reviewLeave(
    "lv-003",
    admin.user.id,
    admin.user.role,
    { decision: "approved", comment: "Trip approved." },
  );
  ok("admin approves pending leave", reviewed.status === "approved");
  ok("approval records reviewer name", reviewed.reviewedBy === "Alice Fernandes");

  await throws(
    "reviewing twice is rejected",
    () =>
      reviewLeave("lv-003", admin!.user.id, admin!.user.role, {
        decision: "rejected",
        comment: "",
      }),
    "already been approved",
  );

  const rejected = await reviewLeave("lv-007", admin.user.id, admin.user.role, {
    decision: "rejected",
    comment: "Peak freeze period.",
  });
  ok("admin rejects another request", rejected.status === "rejected");
  ok("rejection stores comment", rejected.reviewComment === "Peak freeze period.");

  const payrollBefore = await getPayrollRows();
  const snehaRow = payrollBefore.find((r) => r.employeeId === "emp-005")!;
  const newSalary = { ...snehaRow.salary, basic: snehaRow.salary.basic + 2000 };
  await updateSalaryStructure("emp-005", "admin", newSalary);
  const payrollAfter = await getPayrollRows();
  ok(
    "salary edit flows into payroll table net pay",
    payrollAfter.find((r) => r.employeeId === "emp-005")?.netPay ===
      snehaRow.netPay + 2000,
  );
  await updateSalaryStructure("emp-005", "admin", snehaRow.salary); // restore

  const david = await updateProfile("emp-004", {
    job: { designation: "Senior QA Engineer" },
  });
  ok("admin edits any employee's job details", david.job.designation === "Senior QA Engineer");

  await throws(
    "negative salary amounts are rejected",
    () =>
      updateSalaryStructure("emp-004", "admin", {
        basic: -5,
        hra: 0,
        allowances: 0,
        deductions: 0,
      }),
    "zero or positive",
  );

  console.log("Employee role:");
  const rahul = await signIn({ email: "rahul@dayflow.com", password: "Emp@1234" });
  ok("employee signs in", rahul.user.role === "employee" && rahul.user.id === "emp-002");

  await throws(
    "employee cannot approve leaves",
    () =>
      reviewLeave("lv-004", rahul.user.id, rahul.user.role, {
        decision: "approved",
        comment: "",
      }),
    "Only Admin/HR",
  );
  await throws(
    "employee cannot edit salaries",
    () =>
      updateSalaryStructure("emp-002", "employee", {
        basic: 1,
        hra: 0,
        allowances: 0,
        deductions: 0,
      }),
    "Only Admin/HR",
  );

  await throws("double check-in blocked", () => checkIn(rahul.user.id), "already checked in");
  const afterOut = await checkOut(rahul.user.id);
  ok("check-out stamps time", Boolean(afterOut.checkOutAt));
  await throws("second check-out blocked", () => checkOut(rahul.user.id));

  // Rahul already had lv-002 approved covering today? No—lv-002 is Priya.
  const from = addDaysISO(today, 20);
  const to = addDaysISO(today, 21);
  const created = await applyLeave(rahul.user.id, {
    type: "paid",
    fromDate: from,
    toDate: to,
    remarks: "Family event.",
  });
  ok("apply leave creates pending request", created.status === "pending");
  ok(
    "new request appears in own list immediately",
    (await getLeaves({ employeeId: rahul.user.id })).some((l) => l.id === created.id),
  );
  await throws(
    "overlapping request rejected",
    () =>
      applyLeave(rahul.user.id, {
        type: "sick",
        fromDate: to,
        toDate: addDaysISO(today, 25),
        remarks: "",
      }),
    "pending or approved leave in this range",
  );
  await throws(
    "inverted date range rejected",
    () =>
      applyLeave(rahul.user.id, {
        type: "paid",
        fromDate: to,
        toDate: from,
        remarks: "",
      }),
    "End date",
  );

  const contact = await updateOwnContactInfo(rahul.user.id, {
    phone: "+91 90000 00000",
    address: "1 Test Lane, Mumbai",
    avatarUrl: "",
  });
  ok(
    "employee edits own phone/address/picture",
    contact.personal.phone === "+91 90000 00000" && contact.avatarUrl === null,
  );

  const docs = await getDocuments("emp-002");
  ok("documents endpoint returns seeded files", docs.length > 0);

  console.log("Sign-up / verification flow:");
  const signup = await signUp({
    employeeCode: "df-1004",
    email: "david.personal@dayflow.com",
    password: "Str0ng!Pass",
    role: "employee",
  });
  ok("sign-up with valid data requires verification", signup.requiresVerification);

  await throws(
    "unverified account cannot sign in",
    () => signIn({ email: "david.personal@dayflow.com", password: "Str0ng!Pass" }),
    "verify your email",
  );
  await verifyEmail("david.personal@dayflow.com");
  const davidSession = await signIn({
    email: "david.personal@dayflow.com",
    password: "Str0ng!Pass",
  });
  ok("after verify, sign-in succeeds", davidSession.user.id === "emp-004");

  await throws(
    "duplicate employee ID sign-up blocked",
    () =>
      signUp({
        employeeCode: "DF-1004",
        email: "other@dayflow.com",
        password: "Str0ng!Pass",
        role: "employee",
      }),
  );
  await throws(
    "duplicate email sign-up blocked",
    () =>
      signUp({
        employeeCode: "DF-1005",
        email: "DAVID.PERSONAL@dayflow.com",
        password: "Str0ng!Pass",
        role: "employee",
      }),
  );
  await throws(
    "weak password rejected",
    () =>
      signUp({
        employeeCode: "DF-1005",
        email: "sneha.alt@dayflow.com",
        password: "weakpass",
        role: "employee",
      }),
    "security rules",
  );
  await throws(
    "unknown employee ID rejected",
    () =>
      signUp({
        employeeCode: "DF-9999",
        email: "nobody@dayflow.com",
        password: "Str0ng!Pass",
        role: "employee",
      }),
    "not found",
  );

  console.log(`\n${passed} passed, ${failures.length} failed`);
  if (failures.length > 0) {
    failures.forEach((f) => console.error(` - ${f}`));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
