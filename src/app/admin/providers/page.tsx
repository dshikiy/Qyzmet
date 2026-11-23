import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TogglePremiumButton } from "@/components/dashboard/admin-actions";
import { formatKzt } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminProvidersPage() {
  await requireRole(["ADMIN"]);

  const providers = await prisma.providerProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
    take: 100,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Мамандар ({providers.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-[#E2E8F0] text-xs text-[#64748B]">
            <tr>
              <th className="py-2.5 pr-4">Маман</th>
              <th className="py-2.5 pr-4">Қала / Аудан</th>
              <th className="py-2.5 pr-4">Бағдарлы баға</th>
              <th className="py-2.5 pr-4">Premium</th>
              <th className="py-2.5">Әрекет</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {providers.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-4">
                  <p className="font-medium text-[#0F172A]">{p.user.name}</p>
                  <p className="text-xs text-[#64748B]">{p.user.email}</p>
                </td>
                <td className="py-3 pr-4 text-[#334155]">
                  {p.city}, {p.publicLocation}
                </td>
                <td className="py-3 pr-4 text-[#0F172A]">
                  {formatKzt(Number(p.indicativePrice))}
                </td>
                <td className="py-3 pr-4">
                  {p.isPremium ? (
                    <Badge variant="premium">Premium</Badge>
                  ) : (
                    <Badge variant="secondary">Қалыпты</Badge>
                  )}
                </td>
                <td className="py-3">
                  <TogglePremiumButton providerId={p.id} isPremium={p.isPremium} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

