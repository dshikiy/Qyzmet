import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { advertisementSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = advertisementSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Жарнама деректерін тексеріңіз." },
        { status: 400 }
      );
    }

    const ad = await prisma.advertisement.create({
      data: {
        title: parsed.data.title,
        advertiserName: parsed.data.advertiserName,
        placement: parsed.data.placement,
        targetUrl: parsed.data.targetUrl || null,
        startsAt: new Date(parsed.data.startsAt),
        expiresAt: new Date(parsed.data.expiresAt),
        isActive: parsed.data.isActive,
      },
    });
    return NextResponse.json({ advertisement: ad }, { status: 201 });
  } catch (error) {
    console.error("Create advertisement error:", error);
    return NextResponse.json({ error: "Қате орын алды." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  const { id, isActive } = await request.json();
  if (!id || typeof isActive !== "boolean") {
    return NextResponse.json({ error: "Жарамсыз дерек." }, { status: 400 });
  }

  const ad = await prisma.advertisement.update({
    where: { id },
    data: { isActive },
  });
  return NextResponse.json({ advertisement: ad });
}

