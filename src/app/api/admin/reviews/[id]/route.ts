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
  const { isVisible } = await request.json();
  if (typeof isVisible !== "boolean") {
    return NextResponse.json({ error: "Жарамсыз мән." }, { status: 400 });
  }

  const review = await prisma.review.update({
    where: { id },
    data: { isVisible },
  });

  return NextResponse.json({ review });
}

