import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { nameKk: "asc" }],
      include: {
        _count: { select: { providers: true } },
      },
    });

    return NextResponse.json({
      categories: categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        nameKk: c.nameKk,
        nameRu: c.nameRu ?? c.nameKk,
        icon: c.icon,
        providerCount: c._count.providers,
      })),
    });
  } catch (error) {
    console.error("List categories error:", error);
    return NextResponse.json({ error: "Санаттарды жүктеу сәтсіз аяқталды." }, { status: 500 });
  }
}

