import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Рұқсат жоқ." }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();
  if (!["PENDING", "PAID", "WAIVED"].includes(status)) {
    return NextResponse.json({ error: "Жарамсыз күй." }, { status: 400 });
  }

  const commission = await prisma.commission.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ commission });
}

