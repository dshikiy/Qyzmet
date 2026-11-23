import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { createReviewSchema } from "@/lib/validations/review";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createReviewSchema.safeParse({
      ...body,
      rating: Number(body.rating),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Пікір деректерін тексеріңіз.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { orderId, rating, comment } = parsed.data;

    const order = await prisma.serviceRequest.findUnique({
      where: { id: orderId },
      include: { review: { select: { id: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Тапсырыс табылмады." }, { status: 404 });
    }

    if (order.customerId !== session.user.id) {
      return NextResponse.json(
        { error: "Тек тапсырыс беруші ғана пікір қалдыра алады." },
        { status: 403 }
      );
    }

    if (order.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Пікірді тек аяқталған тапсырысқа қалдыруға болады." },
        { status: 400 }
      );
    }

    if (order.review) {
      return NextResponse.json(
        { error: "Бұл тапсырысқа пікір бұрыннан қалдырылған." },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        orderId: order.id,
        customerId: session.user.id,
        providerId: order.providerId,
        rating,
        comment,
        isVisible: true,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json(
      { error: "Пікір сақтау кезінде қате орын алды." },
      { status: 500 }
    );
  }
}

