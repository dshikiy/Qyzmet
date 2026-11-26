import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { signMobileToken } from "@/lib/auth/mobile-token";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const limit = checkRateLimit(`mobile-login:${ip}`, 15, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Тым көп сұраныс. Бір минуттан кейін қайталап көріңіз." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Электрондық пошта мен құпиясөзді тексеріңіз." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        createdAt: true,
        providerProfile: {
          select: { id: true, city: true, isPremium: true },
        },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Электрондық пошта немесе құпиясөз қате." },
        { status: 401 }
      );
    }

    const { accessToken, expiresAt } = signMobileToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      accessToken,
      expiresAt,
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
  } catch (error) {
    console.error("Mobile login error:", error);
    return NextResponse.json({ error: "Кіру кезінде қате орын алды." }, { status: 500 });
  }
}

