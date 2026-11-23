import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { DEFAULT_CITY } from "@/constants/cities";

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const limit = checkRateLimit(`register:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Тым көп сұраныс. Бір минуттан кейін қайталап көріңіз." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Деректерді тексеріңіз",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password, role } = parsed.data;

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

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (role === "PROVIDER") {
        await tx.providerProfile.create({
          data: {
            userId: created.id,
            city: DEFAULT_CITY.nameKk,
            publicLocation: DEFAULT_CITY.nameKk,
            latitude: DEFAULT_CITY.latitude,
            longitude: DEFAULT_CITY.longitude,
            description: "",
            experience: "",
            indicativePrice: 0,
          },
        });
      }

      return created;
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Тіркелу кезінде қате орын алды. Қайталап көріңіз." },
      { status: 500 }
    );
  }
}

