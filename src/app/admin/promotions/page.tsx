import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CommissionStatusButton,
  CreateAdvertisementForm,
  CreatePromotionForm,
} from "@/components/dashboard/admin-actions";
import { formatDateKk, formatKzt } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  await requireRole(["ADMIN"]);

  const [providers, promotions, advertisements, commissions] = await Promise.all([
    prisma.providerProfile.findMany({
      include: { user: { select: { name: true } } },
    }),
    prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
      include: { provider: { include: { user: { select: { name: true } } } } },
    }),
    prisma.advertisement.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.commission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            provider: { include: { user: { select: { name: true } } } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Commissions */}
      <Card>
        <CardHeader>
          <CardTitle>Комиссия есебі ({commissions.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {commissions.length === 0 ? (
            <p className="text-sm text-[#64748B]">
              Аяқталған тапсырыстар бойынша комиссия жазбалары әзірге жоқ.
            </p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="border-b border-[#E2E8F0] text-xs text-[#64748B]">
                <tr>
                  <th className="py-2 pr-4">Маман</th>
                  <th className="py-2 pr-4">Мөлшерлеме</th>
                  <th className="py-2 pr-4">Сома</th>
                  <th className="py-2 pr-4">Күйі</th>
                  <th className="py-2">Әрекет</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4 font-medium text-[#0F172A]">
                      {c.order.provider.user.name}
                    </td>
                    <td className="py-3 pr-4 text-[#64748B]">
                      {Math.round(Number(c.rate) * 100)}%
                    </td>
                    <td className="py-3 pr-4 font-semibold text-[#0F172A]">
                      {formatKzt(Number(c.amount))}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={c.status === "PAID" ? "success" : "warning"}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <CommissionStatusButton
                        commissionId={c.id}
                        status={c.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Profile Promotions */}
      <Card>
        <CardHeader>
          <CardTitle>Профильді ақылы жылжыту ({promotions.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CreatePromotionForm
            providers={providers.map((p) => ({ id: p.id, name: p.user.name }))}
          />
          {promotions.length > 0 && (
            <div className="divide-y divide-[#F1F5F9] text-sm">
              {promotions.map((pr) => (
                <div key={pr.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#0F172A]">
                      {pr.provider.user.name} · {pr.type}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {formatDateKk(pr.startsAt)} — {formatDateKk(pr.expiresAt)}
                    </p>
                  </div>
                  <Badge variant={pr.status === "ACTIVE" ? "success" : "secondary"}>
                    {pr.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paid Advertisements */}
      <Card>
        <CardHeader>
          <CardTitle>Ақылы жарнама жазбалары ({advertisements.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <CreateAdvertisementForm />
          {advertisements.length > 0 && (
            <div className="divide-y divide-[#F1F5F9] text-sm">
              {advertisements.map((ad) => (
                <div key={ad.id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-[#0F172A]">
                      {ad.title} ({ad.advertiserName})
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {ad.placement} · {formatDateKk(ad.startsAt)} —{" "}
                      {formatDateKk(ad.expiresAt)}
                    </p>
                  </div>
                  <Badge variant={ad.isActive ? "success" : "secondary"}>
                    {ad.isActive ? "Белсенді" : "Өшірулі"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

