import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleReviewButton } from "@/components/dashboard/admin-actions";
import { formatDateKk } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  await requireRole(["ADMIN"]);

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      provider: { include: { user: { select: { name: true } } } },
    },
    take: 100,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Пікірлерді модерациялау ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-sm text-[#64748B]">Пікірлер әзірге жоқ.</p>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-[#E2E8F0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-[#0F172A]">
                    {r.customer.name} → {r.provider.user.name}
                  </span>
                  <Badge variant="default">{r.rating} / 5</Badge>
                  <Badge variant={r.isVisible ? "success" : "secondary"}>
                    {r.isVisible ? "Көрінеді" : "Жасырылған"}
                  </Badge>
                </div>
                <p className="text-[#334155]">{r.comment}</p>
                <p className="text-xs text-[#94A3B8]">{formatDateKk(r.createdAt)}</p>
              </div>
              <ToggleReviewButton reviewId={r.id} isVisible={r.isVisible} />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

