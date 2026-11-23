import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { getProvidersForMap } from "@/server/services/providers";
import { ProviderMap } from "@/components/maps/provider-map";

export const metadata: Metadata = {
  title: "Мамандар картасы",
  description:
    "Ақтау және Қазақстан бойынша мамандарды интерактивті картадан табыңыз.",
};

export const dynamic = "force-dynamic";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const [providers, categories] = await Promise.all([
    getProvidersForMap(),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, nameKk: true, slug: true },
    }),
  ]);

  return (
    <div className="container-app py-8 sm:py-12 space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
          Мамандар картасы
        </h1>
        <p className="mt-1.5 text-sm text-[#64748B]">
          Өзіңізге жақын орналасқан мамандарды картадан қарап, профиліне өтіңіз.
        </p>
      </div>

      <ProviderMap
        providers={providers}
        categories={categories}
        initialCategory={sp.category ?? ""}
      />
    </div>
  );
}

