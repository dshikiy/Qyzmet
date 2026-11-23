import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { calculateAverageRating, formatDateKk, formatRating } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function ProviderDashboardPage() {
  const user = await requireRole(["PROVIDER", "ADMIN"]);

  const profile = await prisma.providerProfile.findUnique({
    where: { userId: user.id },
    include: {
      categories: true,
      requests: {
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { nameKk: true } },
          customer: { select: { name: true } },
        },
        take: 20,
      },
      reviews: {
        where: { isVisible: true },
        select: { rating: true },
      },
    },
  });

  const requests = profile?.requests ?? [];
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const activeCount = requests.filter((r) =>
    ["NEGOTIATING", "AGREED", "IN_PROGRESS"].includes(r.status)
  ).length;
  const completedCount = requests.filter((r) => r.status === "COMPLETED").length;
  const avgRating = calculateAverageRating(
    (profile?.reviews ?? []).map((r) => r.rating)
  );

  return (
    <div className="space-y-6">
      {(!profile || profile.categories.length === 0 || !profile.description) && (
        <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#1E40AF]">
              Кәсіби профиліңізді толықтырыңыз
            </p>
            <p className="text-xs text-[#334155] mt-1">
              Қызмет санаттарын, бағдарлы бағаны және ауданды көрсетсеңіз,
              тапсырыс берушілер сізді тез табады.
            </p>
          </div>
          <Link href="/provider/profile">
            <Button size="sm">Профильді толтыру</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[#64748B]">Жаңа өтінімдер</p>
            <p className="mt-1 text-2xl font-bold text-[#F59E0B]">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[#64748B]">Белсенді</p>
            <p className="mt-1 text-2xl font-bold text-[#2563EB]">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[#64748B]">Аяқталған</p>
            <p className="mt-1 text-2xl font-bold text-[#16A34A]">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[#64748B]">Орташа рейтинг</p>
            <p className="mt-1 text-2xl font-bold text-[#0F172A]">
              {formatRating(avgRating)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Келген өтінімдер</CardTitle>
          <Link href="/provider/orders">
            <Button variant="outline" size="sm">
              Барлығын көру
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-sm text-[#64748B]">
              Әзірге кіріс өтінімдері жоқ.
            </p>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {requests.slice(0, 6).map((req) => (
                <Link
                  key={req.id}
                  href={`/provider/orders/${req.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5 hover:bg-[#F8FAFC] -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {req.category.nameKk} — {req.customer.name}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {formatDateKk(req.createdAt)} · {req.preferredDate}{" "}
                      {req.preferredTime}
                    </p>
                  </div>
                  <OrderStatusBadge status={req.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

