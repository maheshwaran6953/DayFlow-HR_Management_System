import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(`${process.env.APP_URL}/login?error=missing_token`);
  }

  const user = await prisma.user.findFirst({ where: { verifyToken: token } });
  if (!user) {
    return NextResponse.redirect(`${process.env.APP_URL}/login?error=invalid_token`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null },
  });

  return NextResponse.redirect(`${process.env.APP_URL}/login?verified=1`);
}
