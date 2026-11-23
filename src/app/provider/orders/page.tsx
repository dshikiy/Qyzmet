import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatDateKk, formatKzt } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function ProviderOrdersPage() {
  const user = await requireRole(["PROVIDER", "ADMIN"]);

  const orders = await prisma.serviceRequest.findMany({
    where: { provider: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { nameKk: true } },
      customer: { select: { name: true } },
    },
  });

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-6 w-6" />}
        title="Кіріс тапсырыстары жоқ"
        description="Тапсырыс берушілер сізге өтінім жібергенде осы жерде көрінеді."
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-semibold text-[#0F172A]">
                  {order.category.nameKk}
                </h2>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-[#334155]">
                Тапсырыс беруші: <span className="font-medium">{order.customer.name}</span>
              </p>
              <p className="text-xs text-[#64748B]">
                {formatDateKk(order.createdAt)} · Қалаулы уақыт: {order.preferredDate}{" "}
                {order.preferredTime}
              </p>
              {order.agreedPrice && (
                <p className="text-sm font-semibold text-[#1E40AF]">
                  Келісілген баға: {formatKzt(Number(order.agreedPrice))}
                </p>
              )}
            </div>
            <Link href={`/provider/orders/${order.id}`}>
              <Button variant="outline" size="sm">
                Басқару
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

