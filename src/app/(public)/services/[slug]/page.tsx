import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { searchProviders } from "@/server/services/providers";
import { CategoryIcon } from "@/components/services/category-icon";
import { ProviderCard } from "@/components/providers/provider-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.serviceCategory.findUnique({
    where: { slug },
  });
  if (!category) return { title: "Санат табылмады" };
  return {
    title: `${category.nameKk} — Мамандар`,
    description: `${category.nameKk} бойынша Ақтау және Қазақстан мамандары.`,
  };
}

export default async function ServiceCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string; page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await prisma.serviceCategory.findFirst({
    where: { slug, isActive: true },
  });

  if (!category) {
    notFound();
  }

  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;
  const result = await searchProviders({
    categorySlug: category.slug,
    city: sp.city,
    page,
    pageSize: 12,
  });

  return (
    <div className="container-app py-10 sm:py-14">
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#2563EB] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Барлық қызметтерге оралу
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB]">
            <CategoryIcon name={category.icon} className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
              {category.nameKk}
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              Табылған мамандар: {result.total}
            </p>
          </div>
        </div>
        <Link href={`/map?category=${category.slug}`}>
          <Button variant="outline">Картадан көру</Button>
        </Link>
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Бұл санатта әзірге мамандар жоқ"
          description="Сіз осы бағыт бойынша қызмет көрсетсеңіз, маман ретінде тіркеліп алғашқы тапсырыстарды қабылдай аласыз."
          action={
            <Link href="/register?role=PROVIDER">
              <Button>Маман ретінде тіркелу</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {result.items.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}

