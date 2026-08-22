import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HttpError, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

const selfEditableFields = ["phone", "address", "profilePicture"] as const;

const patchSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  joinedDate: z.coerce.date().optional(),
  profilePicture: z.string().optional(),
  documents: z.string().optional(),
});

async function getTargetProfile(targetUserId: string) {
  const session = await requireUser();
  if (session.role !== "ADMIN" && session.id !== targetUserId) {
    throw new HttpError(403, "You can only access your own profile");
  }
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      employeeId: true,
      email: true,
      role: true,
      createdAt: true,
      profile: { include: { salary: true } },
    },
  });
  if (!user || !user.profile) throw new HttpError(404, "Profile not found");
  return { session, user };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handle(async () => {
    const { user } = await getTargetProfile(params.id);
    return NextResponse.json({ user });
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return handle(async () => {
    const { session, user } = await getTargetProfile(params.id);

    const body = patchSchema.parse(await req.json());

    if (session.role !== "ADMIN") {
      const attempted = Object.keys(body).filter(
        (key) => !selfEditableFields.includes(key as (typeof selfEditableFields)[number])
      );
      if (attempted.length > 0) {
        throw new HttpError(403, `Employees cannot edit field(s): ${attempted.join(", ")}`);
      }
    }

    const updated = await prisma.employeeProfile.update({
      where: { userId: params.id },
      data: body,
    });

    return NextResponse.json({
      message: "Profile updated",
      profile: updated,
      editedBy: session.role === "ADMIN" && session.id !== user.id ? "admin" : "self",
    });
  });
}
