import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setAuthCookie } from "@/lib/auth";
import { handle } from "@/lib/api";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = loginSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in" },
        { status: 403 }
      );
    }

    return setAuthCookie({
      id: user.id,
      employeeId: user.employeeId,
      email: user.email,
      role: user.role as "ADMIN" | "EMPLOYEE",
    });
  });
}
