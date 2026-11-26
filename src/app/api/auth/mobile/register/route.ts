import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { DEFAULT_CITY, getCityByName } from "@/constants/cities";
import { signMobileToken } from "@/lib/auth/mobile-token";

const mobileRegisterSchema = registerSchema.extend({
  phone: z
    .string()
    .trim()
    .regex(/^\+77\d{9}$/, "Қазақстандық дұрыс мобильді нөмірді енгізіңіз (+77XXXXXXXXX)")
    .optional(),
  city: z.string().trim().min(2).max(60).optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const limit = checkRateLimit(`mobile-register:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Тым көп сұраныс. Бір минуттан кейін қайталап көріңіз." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = mobileRegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Деректерді тексеріңіз",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, role, city } = parsed.data;
    const cityObj = city ? getCityByName(city) : DEFAULT_CITY;

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Бұл электрондық пошта бұрыннан тіркелген." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, passwordHash, role },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });

      let providerProfileId: string | null = null;
      if (role === "PROVIDER") {
        const profile = await tx.providerProfile.create({
          data: {
            userId: user.id,
            city: cityObj.nameKk,
            publicLocation: cityObj.nameKk,
            latitude: cityObj.latitude,
            longitude: cityObj.longitude,
            description: "",
            experience: "",
            indicativePrice: 0,
          },
          select: { id: true },
        });
        providerProfileId = profile.id;
      }

      return { user, providerProfileId };
    });

    const { accessToken, expiresAt } = signMobileToken({
      id: created.user.id,
      name: created.user.name,
      email: created.user.email,
      role: created.user.role,
    });

    return NextResponse.json(
      {
        accessToken,
        expiresAt,
        user: {
          id: created.user.id,
          name: created.user.name,
          email: created.user.email,
          role: created.user.role,
          city: cityObj.nameKk,
          providerProfileId: created.providerProfileId,
          createdAt: created.user.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Mobile register error:", error);
    return NextResponse.json(
      { error: "Тіркелу кезінде қате орын алды." },
      { status: 500 }
    );
  }
}
