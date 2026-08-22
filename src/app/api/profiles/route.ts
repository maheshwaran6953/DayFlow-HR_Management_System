import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

export async function GET() {
  return handle(async () => {
    await requireAdmin();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        employeeId: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        profile: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ employees: users });
  });
}
