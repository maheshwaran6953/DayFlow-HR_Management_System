import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

const patchSchema = z.object({
  baseSalary: z.number().nonnegative(),
  allowances: z.number().nonnegative().default(0),
  deductions: z.number().nonnegative().default(0),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handle(async () => {
    await requireAdmin();
    const body = patchSchema.parse(await req.json());

    const profile = await prisma.employeeProfile.findUnique({ where: { userId: params.id } });
    if (!profile) throw new HttpError(404, "Employee not found");

    const salary = await prisma.salaryStructure.upsert({
      where: { profileId: profile.id },
      create: { profileId: profile.id, ...body },
      update: { ...body, effectiveFrom: new Date() },
    });

    return NextResponse.json({ message: "Salary structure updated", salary });
  });
}
