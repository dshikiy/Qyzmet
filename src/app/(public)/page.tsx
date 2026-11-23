import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Handshake } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { searchProviders } from "@/server/services/providers";
import { HeroSearch } from "@/components/services/hero-search";
import { CategoryIcon } from "@/components/services/category-icon";
import { ProviderCard } from "@/components/providers/provider-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { DEFAULT_CITY } from "@/constants/cities";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, nearbyProviders] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { providers: true } },
      },
    }),
    searchProviders({
      city: DEFAULT_CITY.nameKk,
      page: 1,
      pageSize: 6,
      sort: "rating",
    }),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#E2E8F0] bg-gradient-to-b from-[#EFF6FF] via-white to-white">
        <div className="container-app py-14 sm:py-20 lg:py-24">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3.5 py-1.5 text-xs font-medium text-[#1E40AF]">
              <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
              <span>Ақтау және Қазақстан бойынша қызметтер</span>
            </div>

            <h1 className="text-[32px] sm:text-5xl lg:text-[54px] font-bold leading-[1.12] tracking-tight text-[#0F172A]">
              Қажетті маманды жақын жерден табыңыз
            </h1>

            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-[#64748B]">
              Электрик, сантехник, репетитор және басқа да мамандарды оңай әрі
              жылдам табыңыз.
            </p>

            <div className="pt-2">
              <HeroSearch />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-14 sm:py-16">
        <div className="container-app">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                Танымал қызметтер
              </h2>
              <p className="mt-1.5 text-sm text-[#64748B]">
                Қажетті бағытты таңдап, мамандар тізімін қараңыз
              </p>
            </div>
            <Link
              href="/services"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8]"
            >
              Барлық қызметтер
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/services/${cat.slug}`}
                className="group flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 transition-colors hover:border-[#2563EB] hover:bg-[#EFF6FF]/40"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                    <CategoryIcon name={cat.icon} className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#0F172A]">
                      {cat.nameKk}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {cat._count.providers} маман
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby Professionals */}
      <section className="border-t border-[#E2E8F0] bg-white py-14 sm:py-16">
        <div className="container-app">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
                Жақын маңдағы мамандар
              </h2>
              <p className="mt-1.5 text-sm text-[#64748B]">
                {DEFAULT_CITY.nameKk} қаласы бойынша тіркелген мамандар
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/map">
                <Button variant="outline" size="sm">
                  Картадан көру
                </Button>
              </Link>
              <Link href="/providers">
                <Button variant="secondary" size="sm">
                  Барлық мамандар
                </Button>
              </Link>
            </div>
          </div>

          {nearbyProviders.items.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {nearbyProviders.items.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<MapPin className="h-6 w-6" />}
              title="Әзірге мамандар тіркелмеген"
              description="Ақтау қаласында алғашқы мамандардың бірі болып тіркеліп, тапсырыстар қабылдаңыз."
              action={
                <Link href="/register?role=PROVIDER">
                  <Button>Маман ретінде тіркелу</Button>
                </Link>
              }
            />
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[#E2E8F0] bg-[#F8FAFC] py-14 sm:py-16">
        <div className="container-app">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              QyzmetTap қалай жұмыс істейді?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#64748B]">
              Үш қарапайым қадам арқылы сенімді маманмен келісіп, қызмет алыңыз.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                1-қадам
              </p>
              <h3 className="text-lg font-semibold text-[#0F172A]">
                Қызметті таңдаңыз
              </h3>
              <p className="text-sm leading-relaxed text-[#64748B]">
                Қажетті санатты немесе картаны пайдаланып, жақын маңдағы
                мамандардың бағасы мен пікірлерін салыстырыңыз.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <Handshake className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                2-қадам
              </p>
              <h3 className="text-lg font-semibold text-[#0F172A]">
                Маманмен келісіңіз
              </h3>
              <p className="text-sm leading-relaxed text-[#64748B]">
                Өтінім жіберіп, жұмыс бағасы, келу уақыты және жұмыс көлемі
                бойынша нақты шарттарды екіжақты растаңыз.
              </p>
            </div>

            <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                3-қадам
              </p>
              <h3 className="text-lg font-semibold text-[#0F172A]">
                Қызметті алыңыз
              </h3>
              <p className="text-sm leading-relaxed text-[#64748B]">
                Жұмыс аяқталған соң тапсырысты растап, маманның жұмысына баға
                мен пікір қалдырыңыз.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-[#E2E8F0] bg-white py-14">
        <div className="container-app">
          <div className="rounded-2xl bg-[#0F172A] px-6 py-10 sm:px-10 sm:py-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#93C5FD]">
                <ShieldCheck className="h-4 w-4" />
                <span>Мамандар үшін</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Қызмет көрсетесіз бе? Жаңа тапсырыстар табыңыз
              </h2>
              <p className="text-sm sm:text-base text-[#CBD5E1]">
                Профиліңізді тіркеп, қызмет аймағыңызды және бағдарлы
                бағаңызды көрсетіңіз.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register?role=PROVIDER">
                <Button size="lg">Маман ретінде тіркелу</Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white hover:bg-white/10"
                >
                  Толығырақ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

