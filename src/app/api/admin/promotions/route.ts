import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { promotionSchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = promotionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Жылжыту деректерін тексеріңіз." },
        { status: 400 }
      );
    }

    const promotion = await prisma.promotion.create({
      data: {
        providerId: parsed.data.providerId,
        type: parsed.data.type,
        startsAt: new Date(parsed.data.startsAt),
        expiresAt: new Date(parsed.data.expiresAt),
        status: parsed.data.status,
      },
    });
    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error) {
    console.error("Create promotion error:", error);
    return NextResponse.json({ error: "Қате орын алды." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  const { id, status } = await request.json();
  if (!id || !["ACTIVE", "EXPIRED", "CANCELLED"].includes(status)) {
    return NextResponse.json({ error: "Жарамсыз дерек." }, { status: 400 });
  }

  const promotion = await prisma.promotion.update({
    where: { id },
    data: { status },
  });
  return NextResponse.json({ promotion });
}

