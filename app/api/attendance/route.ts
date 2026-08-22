import { NextRequest, NextResponse } from "next/server";
import { HttpError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";
import { endOfDay, startOfDay, startOfWeek } from "@/lib/dates";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireUser();
    const params = req.nextUrl.searchParams;

    let targetUserId: string | undefined = session.id;
    if (session.role === "ADMIN") {
      targetUserId = params.get("userId") || undefined;
    } else if (params.get("userId")) {
      throw new HttpError(403, "Employees can only view their own attendance");
    }

    const view = params.get("view") || "daily";
    const refDate = params.get("date") ? new Date(params.get("date")!) : new Date();

    const where: { userId?: string; date: { gte: Date; lte?: Date } } = {
      date: {} as { gte: Date; lte?: Date },
    };
    if (targetUserId) where.userId = targetUserId;

    if (view === "weekly") {
      where.date.gte = startOfWeek(refDate);
      where.date.lte = endOfDay(new Date(startOfWeek(refDate).getTime() + 6 * 86400000));
    } else {
      where.date.gte = startOfDay(refDate);
      where.date.lte = endOfDay(refDate);
    }

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { date: "desc" },
      select: {
        id: true,
        userId: true,
        date: true,
        checkIn: true,
        checkOut: true,
        status: true,
        user: { select: { employeeId: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });

    return NextResponse.json({ records });
  });
}
