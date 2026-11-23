import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { createOrderSchema } from "@/lib/validations/order";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  const user = session.user;
  const where =
    user.role === "ADMIN"
      ? {}
      : user.role === "PROVIDER"
        ? { provider: { userId: user.id } }
        : { customerId: user.id };

  const orders = await prisma.serviceRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { id: true, nameKk: true, slug: true } },
      customer: { select: { id: true, name: true } },
      provider: {
        select: {
          id: true,
          city: true,
          publicLocation: true,
          user: { select: { id: true, name: true } },
        },
      },
      review: { select: { id: true, rating: true } },
    },
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Өтінім деректерін тексеріңіз.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { providerId, categoryId, description, address, preferredDate, preferredTime } =
      parsed.data;

    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      select: { id: true, userId: true },
    });

    if (!provider) {
      return NextResponse.json({ error: "Маман табылмады." }, { status: 404 });
    }

    if (provider.userId === session.user.id) {
      return NextResponse.json(
        { error: "Өз профиліңізге тапсырыс бере алмайсыз." },
        { status: 400 }
      );
    }

    const category = await prisma.serviceCategory.findFirst({
      where: { id: categoryId, isActive: true },
      select: { id: true },
    });

    if (!category) {
      return NextResponse.json({ error: "Қызмет санаты табылмады." }, { status: 404 });
    }

    const order = await prisma.serviceRequest.create({
      data: {
        customerId: session.user.id,
        providerId: provider.id,
        categoryId: category.id,
        description,
        address,
        preferredDate,
        preferredTime,
        status: "PENDING",
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Өтінім құру кезінде қате орын алды." },
      { status: 500 }
    );
  }
}

