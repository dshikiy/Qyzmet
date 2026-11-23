import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { categorySchema } from "@/lib/validations/admin";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Санат деректерін тексеріңіз." },
        { status: 400 }
      );
    }

    const category = await prisma.serviceCategory.create({
      data: parsed.data,
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Санат құру кезінде қате орын алды." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  try {
    const { id, isActive } = await request.json();
    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Жарамсыз дерек." }, { status: 400 });
    }

    const category = await prisma.serviceCategory.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Қате орын алды." }, { status: 500 });
  }
}

