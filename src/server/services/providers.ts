import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { calculateAverageRating } from "@/lib/utils/format";
import { calculateDistanceKm } from "@/lib/utils/geo";
import type { ProviderCardData } from "@/components/providers/provider-card";

export interface ProviderSearchParams {
  q?: string;
  categorySlug?: string;
  city?: string;
  minRating?: number;
  maxPrice?: number;
  sort?: "rating" | "price_asc" | "price_desc" | "distance";
  lat?: number;
  lng?: number;
  page?: number;
  pageSize?: number;
}

export interface ProviderSearchResult {
  items: ProviderCardData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function searchProviders(
  params: ProviderSearchParams
): Promise<ProviderSearchResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, params.pageSize ?? 12));
  const now = new Date();

  const where: Prisma.ProviderProfileWhereInput = {};

  if (params.city && params.city.trim() !== "" && params.city !== "Барлық қалалар") {
    where.city = {
      equals: params.city.trim(),
      mode: "insensitive",
    };
  }

  if (params.categorySlug) {
    where.categories = {
      some: {
        category: {
          slug: params.categorySlug,
          isActive: true,
        },
      },
    };
  }

  if (params.q && params.q.trim() !== "") {
    const query = params.q.trim();
    where.OR = [
      { user: { name: { contains: query, mode: "insensitive" } } },
      { description: { contains: query, mode: "insensitive" } },
      { publicLocation: { contains: query, mode: "insensitive" } },
      {
        categories: {
          some: {
            category: {
              nameKk: { contains: query, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  if (typeof params.maxPrice === "number" && Number.isFinite(params.maxPrice) && params.maxPrice > 0) {
    where.indicativePrice = {
      lte: new Prisma.Decimal(params.maxPrice),
    };
  }

  const allMatching = await prisma.providerProfile.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true },
      },
      categories: {
        include: {
          category: {
            select: { id: true, nameKk: true, slug: true, isActive: true },
          },
        },
      },
      reviews: {
        where: { isVisible: true },
        select: { rating: true },
      },
      promotions: {
        where: {
          status: "ACTIVE",
          startsAt: { lte: now },
          expiresAt: { gte: now },
        },
        select: { id: true, type: true },
      },
    },
  });

  const hasCoords =
    typeof params.lat === "number" &&
    typeof params.lng === "number" &&
    Number.isFinite(params.lat) &&
    Number.isFinite(params.lng);

  let mapped: ProviderCardData[] = allMatching.map((p) => {
    const ratings = p.reviews.map((r) => r.rating);
    const averageRating = calculateAverageRating(ratings);
    const distanceKm =
      hasCoords && p.latitude != null && p.longitude != null
        ? calculateDistanceKm(params.lat!, params.lng!, p.latitude, p.longitude)
        : null;

    return {
      id: p.id,
      name: p.user.name,
      avatarUrl: p.avatarUrl,
      city: p.city,
      publicLocation: p.publicLocation,
      indicativePrice: Number(p.indicativePrice),
      isPremium: p.isPremium,
      isPromoted: p.promotions.length > 0,
      categories: p.categories
        .filter((c) => c.category.isActive)
        .map((c) => ({
          id: c.category.id,
          nameKk: c.category.nameKk,
          slug: c.category.slug,
        })),
      averageRating,
      reviewCount: ratings.length,
      distanceKm,
    };
  });

  if (typeof params.minRating === "number" && params.minRating > 0) {
    mapped = mapped.filter((p) => p.averageRating >= params.minRating!);
  }

  const sort = params.sort ?? (hasCoords ? "distance" : "rating");
  mapped.sort((a, b) => {
    if (sort === "distance" && hasCoords) {
      const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
      const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
      if (da !== db) return da - db;
      return b.averageRating - a.averageRating;
    }
    if (sort === "price_asc") {
      return a.indicativePrice - b.indicativePrice;
    }
    if (sort === "price_desc") {
      return b.indicativePrice - a.indicativePrice;
    }
    // Default "rating" sort: organic rating first, then review count
    if (b.averageRating !== a.averageRating) {
      return b.averageRating - a.averageRating;
    }
    return b.reviewCount - a.reviewCount;
  });

  const total = mapped.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const items = mapped.slice(start, start + pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getProvidersForMap(categorySlug?: string, city?: string) {
  const where: Prisma.ProviderProfileWhereInput = {
    latitude: { not: null },
    longitude: { not: null },
  };

  if (city && city !== "Барлық қалалар") {
    where.city = { equals: city, mode: "insensitive" };
  }

  if (categorySlug) {
    where.categories = {
      some: {
        category: { slug: categorySlug, isActive: true },
      },
    };
  }

  const rows = await prisma.providerProfile.findMany({
    where,
    include: {
      user: { select: { name: true } },
      categories: {
        include: {
          category: { select: { id: true, nameKk: true, slug: true } },
        },
      },
      reviews: {
        where: { isVisible: true },
        select: { rating: true },
      },
    },
    take: 200,
  });

  return rows.map((p) => ({
    id: p.id,
    name: p.user.name,
    city: p.city,
    publicLocation: p.publicLocation,
    latitude: p.latitude!,
    longitude: p.longitude!,
    indicativePrice: Number(p.indicativePrice),
    isPremium: p.isPremium,
    categories: p.categories.map((c) => c.category),
    averageRating: calculateAverageRating(p.reviews.map((r) => r.rating)),
    reviewCount: p.reviews.length,
  }));
}

