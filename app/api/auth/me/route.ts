import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

export async function GET() {
  return handle(async () => {
    const session = await requireUser();

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        employeeId: true,
        email: true,
        role: true,
        createdAt: true,
        profile: {
          include: { salary: true },
        },
      },
    });

    if (!user) throw new Error("Session user no longer exists");

    return NextResponse.json({ user });
  });
}
