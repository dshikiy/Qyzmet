import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { calculateAverageRating } from "@/lib/utils/format";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const profile = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        categories: {
          include: {
            category: {
              select: { id: true, nameKk: true, nameRu: true, slug: true, isActive: true },
            },
          },
        },
        reviews: {
          where: { isVisible: true },
          orderBy: { createdAt: "desc" },
          include: {
            customer: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: {
            requests: { where: { status: "COMPLETED" } },
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Маман табылмады." }, { status: 404 });
    }

    const ratings = profile.reviews.map((r) => r.rating);
    const averageRating = calculateAverageRating(ratings);

    return NextResponse.json({
      provider: {
        id: profile.id,
        name: profile.user.name,
        avatarUrl: profile.avatarUrl,
        description: profile.description,
        experience: profile.experience,
        city: profile.city,
        publicLocation: profile.publicLocation,
        latitude: profile.latitude,
        longitude: profile.longitude,
        indicativePrice: Number(profile.indicativePrice),
        isPremium: profile.isPremium,
        averageRating,
        reviewCount: profile.reviews.length,
        completedBookings: profile._count.requests,
        categories: profile.categories
          .filter((c) => c.category.isActive)
          .map((c) => ({
            id: c.category.id,
            slug: c.category.slug,
            nameKk: c.category.nameKk,
            nameRu: c.category.nameRu ?? c.category.nameKk,
          })),
        reviews: profile.reviews.map((r) => ({
          id: r.id,
          orderId: r.orderId,
          customerId: r.customerId,
          customerName: r.customer.name,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Get provider detail error:", error);
    return NextResponse.json({ error: "Маман профилін жүктеу сәтсіз аяқталды." }, { status: 500 });
  }
}

