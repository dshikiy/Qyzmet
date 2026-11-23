import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, MapPin, Star, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateOrderForm } from "@/components/orders/create-order-form";
import {
  calculateAverageRating,
  formatDateKk,
  formatKzt,
  formatRating,
} from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const provider = await prisma.providerProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!provider) return { title: "Маман табылмады" };
  return {
    title: `${provider.user.name} — ${provider.city}`,
    description: provider.description.slice(0, 155) || `${provider.user.name} — QyzmetTap маманы`,
  };
}

export default async function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [provider, currentUser, allActiveCategories] = await Promise.all([
    prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        categories: {
          include: {
            category: { select: { id: true, nameKk: true, slug: true } },
          },
        },
        reviews: {
          where: { isVisible: true },
          orderBy: { createdAt: "desc" },
          include: {
            customer: { select: { name: true } },
          },
        },
      },
    }),
    getCurrentUser(),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, nameKk: true },
    }),
  ]);

  if (!provider) {
    notFound();
  }

  const avgRating = calculateAverageRating(provider.reviews.map((r) => r.rating));
  const providerCategories = provider.categories.map((c) => c.category);
  const selectableCategories =
    providerCategories.length > 0 ? providerCategories : allActiveCategories;

  return (
    <div className="container-app py-8 sm:py-12">
      <Link
        href="/providers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#2563EB] mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Мамандар тізіміне оралу
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Header card */}
          <Card>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <Avatar
                  name={provider.user.name}
                  src={provider.avatarUrl}
                  size="xl"
                />
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                      {provider.user.name}
                    </h1>
                    {provider.isPremium && <Badge variant="premium">Premium</Badge>}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#64748B]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#2563EB]" />
                      {provider.city}, {provider.publicLocation}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
                      <strong className="text-[#0F172A]">
                        {formatRating(avgRating)}
                      </strong>
                      ({provider.reviews.length} пікір)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {providerCategories.map((cat) => (
                      <Link key={cat.id} href={`/services/${cat.slug}`}>
                        <Badge variant="default">{cat.nameKk}</Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
                <div>
                  <p className="text-xs text-[#64748B]">Бағдарлы баға</p>
                  <p className="mt-1 text-lg font-bold text-[#0F172A]">
                    {formatKzt(Number(provider.indicativePrice))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#64748B] flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    Жұмыс тәжірибесі
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#0F172A]">
                    {provider.experience || "Көрсетілмеген"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-base font-semibold text-[#0F172A]">
                  Маман туралы
                </h2>
                <p className="text-sm leading-relaxed text-[#334155] whitespace-pre-line">
                  {provider.description ||
                    "Маман өзі туралы толық ақпаратты әлі толтырмаған."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#2563EB]" />
                <span>Тапсырыс берушілердің пікірлері ({provider.reviews.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {provider.reviews.length === 0 ? (
                <p className="text-sm text-[#64748B]">
                  Әзірге пікірлер жоқ. Тапсырыс аяқталғаннан кейін алғашқы
                  пікірді қалдыра аласыз.
                </p>
              ) : (
                provider.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-[#0F172A]">
                        {review.customer.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F172A]">
                          <Star className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
                          {review.rating}.0
                        </span>
                        <span className="text-xs text-[#94A3B8]">
                          {formatDateKk(review.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[#334155] leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: Order Form */}
        <div className="lg:sticky lg:top-24">
          <CreateOrderForm
            providerId={provider.id}
            providerName={provider.user.name}
            categories={selectableCategories}
            isAuthenticated={Boolean(currentUser)}
            isOwnProfile={currentUser?.id === provider.user.id}
          />
        </div>
      </div>
    </div>
  );
}

