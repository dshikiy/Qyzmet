import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatDateKk } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);

  const orders = await prisma.serviceRequest.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { nameKk: true } },
      provider: { include: { user: { select: { name: true } } } },
    },
    take: 20,
  });

  const activeCount = orders.filter((o) =>
    ["PENDING", "NEGOTIATING", "AGREED", "IN_PROGRESS"].includes(o.status)
  ).length;
  const completedCount = orders.filter((o) => o.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[#64748B]">Барлық тапсырыстар</p>
            <p className="mt-1 text-2xl font-bold text-[#0F172A]">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[#64748B]">Белсенді тапсырыстар</p>
            <p className="mt-1 text-2xl font-bold text-[#2563EB]">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-[#64748B]">Аяқталған тапсырыстар</p>
            <p className="mt-1 text-2xl font-bold text-[#16A34A]">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Соңғы тапсырыстар</CardTitle>
          <Link href="/providers">
            <Button size="sm">Маман табу</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-[#64748B]">
              Сізде әзірге тапсырыстар жоқ. Мамандар каталогынан қажетті
              қызметті таңдаңыз.
            </p>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3.5 hover:bg-[#F8FAFC] -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#0F172A]">
                      {order.category.nameKk} — {order.provider.user.name}
                    </p>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      {formatDateKk(order.createdAt)} · {order.preferredDate}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

