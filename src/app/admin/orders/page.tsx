import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatDateKk, formatKzt } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireRole(["ADMIN"]);

  const orders = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { nameKk: true } },
      customer: { select: { name: true } },
      provider: { include: { user: { select: { name: true } } } },
    },
    take: 100,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Тапсырыстар ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-[#E2E8F0] text-xs text-[#64748B]">
            <tr>
              <th className="py-2.5 pr-4">Санат</th>
              <th className="py-2.5 pr-4">Тапсырыс беруші</th>
              <th className="py-2.5 pr-4">Маман</th>
              <th className="py-2.5 pr-4">Баға</th>
              <th className="py-2.5 pr-4">Күйі</th>
              <th className="py-2.5">Күні</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="py-3 pr-4 font-medium text-[#0F172A]">
                  {o.category.nameKk}
                </td>
                <td className="py-3 pr-4 text-[#334155]">{o.customer.name}</td>
                <td className="py-3 pr-4 text-[#334155]">{o.provider.user.name}</td>
                <td className="py-3 pr-4 text-[#0F172A]">
                  {o.agreedPrice ? formatKzt(Number(o.agreedPrice)) : "—"}
                </td>
                <td className="py-3 pr-4">
                  <OrderStatusBadge status={o.status} />
                </td>
                <td className="py-3 text-[#64748B]">{formatDateKk(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

