import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestUser } from "@/lib/auth/mobile-token";
import { prisma } from "@/lib/db/prisma";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Аты-жөніңіз кемінде 2 таңбадан тұруы тиіс").max(100),
});

export async function PATCH(request: Request) {
  const authUser = await getRequestUser(request);
  if (!authUser) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Аты-жөніңізді дұрыс енгізіңіз." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: authUser.id },
      data: { name: parsed.data.name },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user profile error:", error);
    return NextResponse.json(
      { error: "Профильді жаңарту кезінде қате орын алды." },
      { status: 500 }
    );
  }
}

