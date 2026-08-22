import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mailer";
import { handle } from "@/lib/api";

const signupSchema = z.object({
  employeeId: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[a-z]/, "Must contain a lowercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  role: z.enum(["ADMIN", "EMPLOYEE"]).default("EMPLOYEE"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = signupSchema.parse(await req.json());

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: body.email }, { employeeId: body.employeeId }] },
    });
    if (existing) {
      const field = existing.email === body.email ? "email" : "employee ID";
      return NextResponse.json({ error: `An account with this ${field} already exists` }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const verifyToken = randomUUID();

    const user = await prisma.user.create({
      data: {
        employeeId: body.employeeId,
        email: body.email,
        passwordHash,
        role: body.role,
        verifyToken,
        profile: {
          create: { firstName: body.firstName, lastName: body.lastName },
        },
      },
      select: { id: true, email: true, employeeId: true, role: true },
    });

    await sendVerificationEmail(body.email, verifyToken);

    return NextResponse.json(
      {
        message: "Account created. Check your email to verify your account.",
        user,
      },
      { status: 201 }
    );
  });
}
