import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireRole(["ADMIN"]);

  const [
    usersCount,
    providersCount,
    categoriesCount,
    ordersCount,
    reviewsCount,
    commissionsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.providerProfile.count(),
    prisma.serviceCategory.count(),
    prisma.serviceRequest.count(),
    prisma.review.count(),
    prisma.commission.count(),
  ]);

  const stats = [
    { label: "Пайдаланушылар", value: usersCount },
    { label: "Мамандар", value: providersCount },
    { label: "Санаттар", value: categoriesCount },
    { label: "Тапсырыстар", value: ordersCount },
    { label: "Пікірлер", value: reviewsCount },
    { label: "Комиссия жазбалары", value: commissionsCount },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-5">
            <p className="text-xs text-[#64748B]">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-[#0F172A]">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

