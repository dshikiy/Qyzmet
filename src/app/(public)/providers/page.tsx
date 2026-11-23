import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { searchProviders } from "@/server/services/providers";
import { ProviderFilters } from "@/components/providers/provider-filters";
import { ProviderCard } from "@/components/providers/provider-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Мамандар каталогы",
  description:
    "Ақтау және Қазақстан бойынша тексерілген мамандарды іздеу, салыстыру және таңдау.",
};

export const dynamic = "force-dynamic";

export default async function ProvidersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;
  const minRating = sp.minRating ? Number(sp.minRating) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;
  const lat = sp.lat ? Number(sp.lat) : undefined;
  const lng = sp.lng ? Number(sp.lng) : undefined;
  const sort = (sp.sort as "rating" | "price_asc" | "price_desc" | "distance") || undefined;

  const [categories, result] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, nameKk: true, slug: true },
    }),
    searchProviders({
      q: sp.q,
      categorySlug: sp.category,
      city: sp.city,
      minRating,
      maxPrice,
      sort,
      lat,
      lng,
      page,
      pageSize: 12,
    }),
  ]);

  function buildPageHref(nextPage: number) {
    const params = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    params.set("page", String(nextPage));
    return `/providers?${params.toString()}`;
  }

  return (
    <div className="container-app py-10 sm:py-12 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
            Мамандар
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            Барлығы {result.total} маман табылды
          </p>
        </div>
        <Link href="/map">
          <Button variant="outline">Картадан іздеу</Button>
        </Link>
      </div>

      <Suspense fallback={null}>
        <ProviderFilters categories={categories} />
      </Suspense>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Мамандар табылмады"
          description="Іздеу шарттарын өзгертіп көріңіз немесе барлық қалалар бойынша іздеңіз."
          action={
            <Link href="/providers">
              <Button variant="outline">Сүзгіні тазарту</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.items.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>

          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {result.page > 1 && (
                <Link href={buildPageHref(result.page - 1)}>
                  <Button variant="outline" size="sm">
                    Алдыңғы
                  </Button>
                </Link>
              )}
              <span className="text-sm text-[#64748B] px-3">
                {result.page} / {result.totalPages}
              </span>
              {result.page < result.totalPages && (
                <Link href={buildPageHref(result.page + 1)}>
                  <Button variant="outline" size="sm">
                    Келесі
                  </Button>
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

