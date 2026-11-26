import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getRequestUser } from "@/lib/auth/mobile-token";
import { prisma } from "@/lib/db/prisma";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import { canUserPerformOrderAction } from "@/lib/permissions/order-transitions";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      category: true,
      customer: { select: { id: true, name: true, email: true } },
      provider: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      negotiations: {
        orderBy: { createdAt: "desc" },
        include: {
          proposedBy: { select: { id: true, name: true, role: true } },
        },
      },
      review: true,
      commission: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Тапсырыс табылмады." }, { status: 404 });
  }

  const isCustomer = order.customerId === user.id;
  const isProvider = order.provider.userId === user.id;
  const isAdmin = user.role === "ADMIN";

  if (!isCustomer && !isProvider && !isAdmin) {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getRequestUser(request);
  if (!user) {
    return NextResponse.json({ error: "Авторизация қажет." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Жарамсыз күй." }, { status: 400 });
    }

    const targetStatus = parsed.data.status;

    const existing = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        provider: { select: { userId: true } },
        commission: { select: { id: true } },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Тапсырыс табылмады." }, { status: 404 });
    }

    const isCustomer = existing.customerId === user.id;
    const isProvider = existing.provider.userId === user.id;

    const check = canUserPerformOrderAction({
      role: user.role,
      isCustomer,
      isProvider,
      currentStatus: existing.status,
      targetStatus,
      bothConfirmed: existing.customerConfirmed && existing.providerConfirmed,
    });

    if (!check.allowed) {
      return NextResponse.json(
        { error: check.reason || "Бұл әрекетке рұқсат жоқ." },
        { status: 403 }
      );
    }

    const commissionRate = Number(process.env.COMMISSION_RATE || "0.10");

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.serviceRequest.update({
        where: { id },
        data: { status: targetStatus },
      });

      if (
        targetStatus === "COMPLETED" &&
        !existing.commission &&
        order.agreedPrice &&
        Number(order.agreedPrice) > 0
      ) {
        const agreedNum = Number(order.agreedPrice);
        const amount = Math.round(agreedNum * commissionRate * 100) / 100;
        await tx.commission.create({
          data: {
            orderId: order.id,
            rate: new Prisma.Decimal(commissionRate),
            amount: new Prisma.Decimal(amount),
            status: "PENDING",
          },
        });
      }

      return order;
    });

    return NextResponse.json({ order: updated });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Тапсырыс күйін жаңарту кезінде қате орын алды." },
      { status: 500 }
    );
  }
}

