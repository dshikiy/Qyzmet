import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateKk } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    take: 100,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Пайдаланушылар ({users.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="border-b border-[#E2E8F0] text-xs text-[#64748B]">
            <tr>
              <th className="py-2.5 pr-4">Аты-жөні</th>
              <th className="py-2.5 pr-4">Email</th>
              <th className="py-2.5 pr-4">Рөлі</th>
              <th className="py-2.5">Тіркелген күні</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 pr-4 font-medium text-[#0F172A]">{u.name}</td>
                <td className="py-3 pr-4 text-[#64748B]">{u.email}</td>
                <td className="py-3 pr-4">
                  <Badge variant={u.role === "ADMIN" ? "premium" : "secondary"}>
                    {u.role}
                  </Badge>
                </td>
                <td className="py-3 text-[#64748B]">{formatDateKk(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

