import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreateCategoryForm,
  ToggleCategoryButton,
} from "@/components/dashboard/admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireRole(["ADMIN"]);

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { providers: true } } },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Жаңа санат қосу</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateCategoryForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Қызмет санаттары ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-[#E2E8F0] text-xs text-[#64748B]">
              <tr>
                <th className="py-2.5 pr-4">Атауы</th>
                <th className="py-2.5 pr-4">Slug</th>
                <th className="py-2.5 pr-4">Мамандар</th>
                <th className="py-2.5 pr-4">Күйі</th>
                <th className="py-2.5">Әрекет</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="py-3 pr-4 font-medium text-[#0F172A]">
                    {cat.nameKk}
                  </td>
                  <td className="py-3 pr-4 text-[#64748B]">{cat.slug}</td>
                  <td className="py-3 pr-4 text-[#334155]">{cat._count.providers}</td>
                  <td className="py-3 pr-4">
                    <Badge variant={cat.isActive ? "success" : "secondary"}>
                      {cat.isActive ? "Белсенді" : "Өшірулі"}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <ToggleCategoryButton id={cat.id} isActive={cat.isActive} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

