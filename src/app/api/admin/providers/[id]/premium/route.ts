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
  const { isPremium } = await request.json();
  if (typeof isPremium !== "boolean") {
    return NextResponse.json({ error: "Жарамсыз мән." }, { status: 400 });
  }

  const provider = await prisma.providerProfile.update({
    where: { id },
    data: { isPremium },
  });

  return NextResponse.json({ provider });
}

