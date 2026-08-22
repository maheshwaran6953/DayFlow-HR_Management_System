import { NextRequest, NextResponse } from "next/server";
import { HttpError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireUser();
    const userIdParam = req.nextUrl.searchParams.get("userId");

    if (session.role === "ADMIN") {
      const salaries = await prisma.salaryStructure.findMany({
        include: {
          profile: {
            select: {
              firstName: true,
              lastName: true,
              user: { select: { id: true, employeeId: true, email: true } },
            },
          },
        },
      });
      return NextResponse.json({ salaries });
    }

    if (userIdParam && userIdParam !== session.id) {
      throw new HttpError(403, "You can only view your own payroll");
    }

    const salary = await prisma.salaryStructure.findUnique({
      where: { profileId: await getProfileId(session.id) },
    });

    return NextResponse.json({ salary });
  });
}

async function getProfileId(userId: string) {
  const profile = await prisma.employeeProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) throw new HttpError(404, "Profile not found");
  return profile.id;
}
