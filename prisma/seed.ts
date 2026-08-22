import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding Dayflow database...");

  const passwordHash = await bcrypt.hash("Password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@dayflow.com" },
    update: {},
    create: {
      employeeId: "EMP0001",
      email: "admin@dayflow.com",
      passwordHash,
      role: "ADMIN",
      emailVerified: true,
      profile: {
        create: {
          firstName: "Kishore",
          lastName: "Prabakar",
          position: "HR Officer",
          department: "Human Resources",
          joinedDate: new Date("2024-01-15"),
          phone: "+91 90000 00001",
          address: "Chennai, India",
          salary: { create: { baseSalary: 120000, allowances: 15000, deductions: 8000 } },
        },
      },
    },
    include: { profile: true },
  });

  const employeeSpecs = [
    { employeeId: "EMP0002", email: "arjun@dayflow.com", firstName: "Arjun", lastName: "Mehta", position: "Frontend Developer", department: "Engineering", base: 80000 },
    { employeeId: "EMP0003", email: "priya@dayflow.com", firstName: "Priya", lastName: "Sharma", position: "Backend Developer", department: "Engineering", base: 85000 },
    { employeeId: "EMP0004", email: "ravi@dayflow.com", firstName: "Ravi", lastName: "Kumar", position: "QA Engineer", department: "Engineering", base: 65000 },
  ];

  for (const spec of employeeSpecs) {
    await prisma.user.upsert({
      where: { email: spec.email },
      update: {},
      create: {
        employeeId: spec.employeeId,
        email: spec.email,
        passwordHash,
        role: "EMPLOYEE",
        emailVerified: true,
        profile: {
          create: {
            firstName: spec.firstName,
            lastName: spec.lastName,
            position: spec.position,
            department: spec.department,
            joinedDate: new Date("2025-03-01"),
            phone: "+91 90000 00" + spec.employeeId.slice(3),
            address: "Chennai, India",
            salary: { create: { baseSalary: spec.base, allowances: 10000, deductions: 5000 } },
          },
        },
      },
      include: { profile: true },
    });
  }

  const arjun = await prisma.user.findUnique({ where: { email: "arjun@dayflow.com" } });
  const priya = await prisma.user.findUnique({ where: { email: "priya@dayflow.com" } });

  if (arjun && priya) {
    for (const user of [arjun, priya]) {
      for (let d = 1; d <= 7; d++) {
        const date = daysAgo(d);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        const checkIn = new Date(date);
        checkIn.setHours(9, 15, 0, 0);
        const checkOut = new Date(date);
        checkOut.setHours(18, 10, 0, 0);
        await prisma.attendanceRecord.upsert({
          where: { userId_date: { userId: user.id, date } },
          update: {},
          create: { userId: user.id, date, checkIn, checkOut, status: "PRESENT" },
        });
      }
      await prisma.attendanceRecord.upsert({
        where: { userId_date: { userId: user.id, date: daysAgo(8) } },
        update: {},
        create: { userId: user.id, date: daysAgo(8), status: "ABSENT" },
      });
    }

    await prisma.leaveRequest.upsert({
      where: { id: "seed-leave-1" },
      update: {},
      create: {
        id: "seed-leave-1",
        userId: arjun.id,
        type: "SICK",
        startDate: daysAgo(-3),
        endDate: daysAgo(-2),
        remarks: "Fever, will rest at home",
        status: "PENDING",
      },
    });
    await prisma.leaveRequest.upsert({
      where: { id: "seed-leave-2" },
      update: {},
      create: {
        id: "seed-leave-2",
        userId: priya.id,
        type: "PAID",
        startDate: daysAgo(10),
        endDate: daysAgo(9),
        remarks: "Family function",
        status: "APPROVED",
        reviewerId: admin.id,
        reviewComment: "Approved. Enjoy!",
        reviewedAt: daysAgo(11),
      },
    });
  }

  console.log("Seed complete.");
  console.log("Admin login:    admin@dayflow.com / Password123");
  console.log("Employee login: arjun@dayflow.com / Password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
