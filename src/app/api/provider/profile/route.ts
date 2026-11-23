import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { providerProfileSchema } from "@/lib/validations/provider";
import { getCityByName } from "@/constants/cities";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROVIDER") {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, email: true } },
      categories: { select: { categoryId: true } },
    },
  });

  return NextResponse.json({ profile });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROVIDER") {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = providerProfileSchema.safeParse({
      ...body,
      indicativePrice: Number(body.indicativePrice ?? 0),
      latitude:
        body.latitude !== undefined && body.latitude !== "" && body.latitude !== null
          ? Number(body.latitude)
          : null,
      longitude:
        body.longitude !== undefined && body.longitude !== "" && body.longitude !== null
          ? Number(body.longitude)
          : null,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Профиль деректерін тексеріңіз.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      experience,
      city,
      publicLocation,
      latitude,
      longitude,
      indicativePrice,
      categoryIds,
    } = parsed.data;

    const cityObj = getCityByName(city);
    const finalLat = latitude ?? cityObj.latitude;
    const finalLng = longitude ?? cityObj.longitude;

    const profile = await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.user.update({
          where: { id: session.user.id },
          data: { name },
        });
      }

      const upserted = await tx.providerProfile.upsert({
        where: { userId: session.user.id },
        update: {
          description,
          experience,
          city,
          publicLocation,
          latitude: finalLat,
          longitude: finalLng,
          indicativePrice: new Prisma.Decimal(indicativePrice),
        },
        create: {
          userId: session.user.id,
          description,
          experience,
          city,
          publicLocation,
          latitude: finalLat,
          longitude: finalLng,
          indicativePrice: new Prisma.Decimal(indicativePrice),
        },
      });

      await tx.providerCategory.deleteMany({
        where: { providerId: upserted.id },
      });

      await tx.providerCategory.createMany({
        data: categoryIds.map((categoryId) => ({
          providerId: upserted.id,
          categoryId,
        })),
        skipDuplicates: true,
      });

      return upserted;
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Update provider profile error:", error);
    return NextResponse.json(
      { error: "Профильді сақтау кезінде қате орын алды." },
      { status: 500 }
    );
  }
}

