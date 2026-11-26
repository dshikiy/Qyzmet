import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getRequestUser } from "@/lib/auth/mobile-token";
import { prisma } from "@/lib/db/prisma";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Ағымдағы құпиясөзді енгізіңіз"),
  newPassword: z
    .string()
    .min(8, "Жаңа құпиясөз кемінде 8 таңбадан тұруы тиіс")
    .max(72, "Құпиясөз тым ұзын"),
});

export async function POST(request: Request) {
  const authUser = await getRequestUser(request);
  if (!authUser) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Құпиясөз деректерін тексеріңіз.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, passwordHash: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Пайдаланушы табылмады." }, { status: 404 });
    }

    const valid = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Ағымдағы құпиясөз қате." },
        { status: 400 }
      );
    }

    const nextHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { passwordHash: nextHash },
    });

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Құпиясөзді жаңарту кезінде қате орын алды." },
      { status: 500 }
    );
  }
}

