import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth/mobile-token";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const authUser = await getRequestUser(request);
  if (!authUser) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      providerProfile: {
        select: { id: true, city: true, isPremium: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Пайдаланушы табылмады." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      city: user.providerProfile?.city ?? "Ақтау",
      providerProfileId: user.providerProfile?.id ?? null,
      createdAt: user.createdAt.toISOString(),
    },
  });
}

