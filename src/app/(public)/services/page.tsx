import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { CategoryIcon } from "@/components/services/category-icon";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Қызметтер каталогы",
  description:
    "QyzmetTap қызмет санаттары: электрик, сантехник, үй тазалау, репетитор, техника жөндеу және басқа қызметтер.",
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { providers: true } },
    },
  });

  return (
    <div className="container-app py-10 sm:py-14">
      <div className="max-w-2xl mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
          Қызметтер каталогы
        </h1>
        <p className="mt-2 text-base text-[#64748B]">
          Қажетті санатты таңдап, өз қалаңыздағы мамандарды салыстырыңыз.
        </p>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="Қызмет санаттары табылмады"
          description="Қазіргі уақытта белсенді қызмет санаттары жоқ."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/services/${cat.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-6 transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF]/30"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <CategoryIcon name={cat.icon} className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-semibold text-[#0F172A]">
                  {cat.nameKk}
                </h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  {cat._count.providers} тіркелген маман
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

