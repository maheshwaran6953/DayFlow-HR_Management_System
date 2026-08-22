import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

const applySchema = z
  .object({
    type: z.enum(["PAID", "SICK", "UNPAID"]),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    remarks: z.string().optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireUser();
    const userIdParam = req.nextUrl.searchParams.get("userId");
    const statusFilter = req.nextUrl.searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (session.role === "ADMIN") {
      if (userIdParam) where.userId = userIdParam;
    } else {
      where.userId = session.id;
    }
    if (statusFilter) where.status = statusFilter.toUpperCase();

    const requests = await prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            employeeId: true,
            email: true,
            profile: { select: { firstName: true, lastName: true } },
          },
        },
        reviewer: {
          select: { employeeId: true, profile: { select: { firstName: true, lastName: true } } },
        },
      },
    });

    return NextResponse.json({ requests });
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireUser();
    const body = applySchema.parse(await req.json());

    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        userId: session.id,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: body.endDate },
        endDate: { gte: body.startDate },
      },
    });
    if (overlapping) {
      throw new HttpError(409, "You already have a pending or approved leave in this date range");
    }

    const request = await prisma.leaveRequest.create({
      data: {
        userId: session.id,
        type: body.type,
        startDate: body.startDate,
        endDate: body.endDate,
        remarks: body.remarks,
      },
    });

    return NextResponse.json({ message: "Leave request submitted", request }, { status: 201 });
  });
}
