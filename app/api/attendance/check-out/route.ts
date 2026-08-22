import { NextResponse } from "next/server";
import { HttpError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";
import { startOfDay } from "@/lib/dates";

export async function POST() {
  return handle(async () => {
    const session = await requireUser();
    const today = startOfDay();

    const existing = await prisma.attendanceRecord.findUnique({
      where: { userId_date: { userId: session.id, date: today } },
    });

    if (!existing?.checkIn) {
      throw new HttpError(409, "You need to check in before checking out");
    }
    if (existing.checkOut) {
      throw new HttpError(409, "You have already checked out today");
    }

    const record = await prisma.attendanceRecord.update({
      where: { id: existing.id },
      data: { checkOut: new Date() },
    });

    return NextResponse.json({ message: "Checked out", record });
  });
}
