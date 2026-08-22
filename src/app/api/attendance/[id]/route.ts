import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

const patchSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handle(async () => {
    await requireAdmin();
    const body = patchSchema.parse(await req.json());

    const existing = await prisma.attendanceRecord.findUnique({ where: { id: params.id } });
    if (!existing) throw new HttpError(404, "Attendance record not found");

    const record = await prisma.attendanceRecord.update({
      where: { id: params.id },
      data: { status: body.status },
    });

    return NextResponse.json({ message: "Attendance updated", record });
  });
}
