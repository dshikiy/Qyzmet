import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getRequestUser } from "@/lib/auth/mobile-token";
import { prisma } from "@/lib/db/prisma";
import { negotiationProposalSchema } from "@/lib/validations/order";

export async function POST(
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
    const parsed = negotiationProposalSchema.safeParse({
      ...body,
      proposedPrice: Number(body.proposedPrice),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Ұсыныс деректерін тексеріңіз.",
          fieldErrors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const order = await prisma.serviceRequest.findUnique({
      where: { id },
      include: { provider: { select: { userId: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Тапсырыс табылмады." }, { status: 404 });
    }

    const isCustomer = order.customerId === user.id;
    const isProvider = order.provider.userId === user.id;

    if (!isCustomer && !isProvider) {
      return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
    }

    if (order.status !== "PENDING" && order.status !== "NEGOTIATING") {
      return NextResponse.json(
        { error: "Бұл тапсырыста келіссөз жүргізу мүмкін емес." },
        { status: 400 }
      );
    }

    const { proposedPrice, proposedDateTime, proposedScope } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      await tx.negotiation.updateMany({
        where: { orderId: id, status: "PROPOSED" },
        data: { status: "SUPERSEDED" },
      });

      const negotiation = await tx.negotiation.create({
        data: {
          orderId: id,
          proposedById: user.id,
          proposedPrice: new Prisma.Decimal(proposedPrice),
          proposedDateTime,
          proposedScope,
          status: "PROPOSED",
        },
      });

      const updatedOrder = await tx.serviceRequest.update({
        where: { id },
        data: {
          status: "NEGOTIATING",
          agreedPrice: new Prisma.Decimal(proposedPrice),
          agreedDateTime: proposedDateTime,
          agreedScope: proposedScope,
          customerConfirmed: isCustomer,
          providerConfirmed: isProvider,
        },
      });

      return { negotiation, order: updatedOrder };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Create negotiation error:", error);
    return NextResponse.json(
      { error: "Ұсыныс жіберу кезінде қате орын алды." },
      { status: 500 }
    );
  }
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
    const order = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        provider: { select: { userId: true } },
        negotiations: {
          where: { status: "PROPOSED" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Тапсырыс табылмады." }, { status: 404 });
    }

    const isCustomer = order.customerId === user.id;
    const isProvider = order.provider.userId === user.id;

    if (!isCustomer && !isProvider) {
      return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
    }

    if (order.status !== "NEGOTIATING") {
      return NextResponse.json(
        { error: "Растау үшін белсенді келіссөз болуы тиіс." },
        { status: 400 }
      );
    }

    const activeProposal = order.negotiations[0];
    if (!activeProposal) {
      return NextResponse.json(
        { error: "Растайтын ұсыныс табылмады." },
        { status: 400 }
      );
    }

    const nextCustomerConfirmed = isCustomer ? true : order.customerConfirmed;
    const nextProviderConfirmed = isProvider ? true : order.providerConfirmed;
    const bothConfirmed = nextCustomerConfirmed && nextProviderConfirmed;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      if (bothConfirmed) {
        await tx.negotiation.update({
          where: { id: activeProposal.id },
          data: { status: "ACCEPTED" },
        });
      }

      return tx.serviceRequest.update({
        where: { id },
        data: {
          customerConfirmed: nextCustomerConfirmed,
          providerConfirmed: nextProviderConfirmed,
          status: bothConfirmed ? "AGREED" : "NEGOTIATING",
        },
      });
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Confirm negotiation error:", error);
    return NextResponse.json(
      { error: "Шарттарды растау кезінде қате орын алды." },
      { status: 500 }
    );
  }
}

