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

    if (existing?.checkIn) {
      throw new HttpError(409, "You have already checked in today");
    }

    const record = await prisma.attendanceRecord.upsert({
      where: { userId_date: { userId: session.id, date: today } },
      create: { userId: session.id, date: today, checkIn: new Date(), status: "PRESENT" },
      update: { checkIn: new Date(), status: "PRESENT" },
    });

    return NextResponse.json({ message: "Checked in", record }, { status: 201 });
  });
}
