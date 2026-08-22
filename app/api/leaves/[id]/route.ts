import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

const patchSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewComment: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handle(async () => {
    const session = await requireAdmin();
    const body = patchSchema.parse(await req.json());

    const existing = await prisma.leaveRequest.findUnique({ where: { id: params.id } });
    if (!existing) throw new HttpError(404, "Leave request not found");
    if (existing.status !== "PENDING") {
      throw new HttpError(409, `This request has already been ${existing.status.toLowerCase()}`);
    }
    if (existing.userId === session.id) {
      throw new HttpError(403, "You cannot review your own leave request");
    }

    const request = await prisma.leaveRequest.update({
      where: { id: params.id },
      data: {
        status: body.status,
        reviewerId: session.id,
        reviewComment: body.reviewComment,
        reviewedAt: new Date(),
      },
    });

    if (body.status === "APPROVED") {
      const dates: Date[] = [];
      for (let d = new Date(request.startDate); d <= request.endDate; d.setDate(d.getDate() + 1)) {
        dates.push(startOfDayCopy(d));
      }
      for (const date of dates) {
        await prisma.attendanceRecord.upsert({
          where: { userId_date: { userId: request.userId, date } },
          create: { userId: request.userId, date, status: "LEAVE" },
          update: { status: "LEAVE" },
        });
      }
    }

    return NextResponse.json({ message: `Leave ${body.status.toLowerCase()}`, request });
  });
}

function startOfDayCopy(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
