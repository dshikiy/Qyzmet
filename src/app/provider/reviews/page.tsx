import { Star, MessageSquare } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateKk } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function ProviderReviewsPage() {
  const user = await requireRole(["PROVIDER", "ADMIN"]);

  const reviews = await prisma.review.findMany({
    where: { provider: { userId: user.id }, isVisible: true },
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
    },
  });

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-6 w-6" />}
        title="Әзірге пікірлер жоқ"
        description="Аяқталған тапсырыстар бойынша тапсырыс берушілер қалдырған пікірлер осы жерде көрсетіледі."
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-[#0F172A]">
                {review.customer.name}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
                  {review.rating}.0
                </span>
                <span className="text-xs text-[#94A3B8]">
                  {formatDateKk(review.createdAt)}
                </span>
              </div>
            </div>
            <p className="text-sm text-[#334155]">{review.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

