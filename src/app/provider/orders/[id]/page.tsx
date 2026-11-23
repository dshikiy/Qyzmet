import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { OrderDetailClient } from "@/components/orders/order-detail-client";

export const dynamic = "force-dynamic";

export default async function ProviderOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["PROVIDER", "ADMIN"]);
  const { id } = await params;

  const order = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      category: true,
      customer: { select: { id: true, name: true } },
      provider: { include: { user: { select: { id: true, name: true } } } },
      negotiations: {
        orderBy: { createdAt: "desc" },
        include: { proposedBy: { select: { name: true } } },
      },
      review: true,
    },
  });

  if (!order || (order.provider.userId !== user.id && user.role !== "ADMIN")) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link
        href="/provider/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#2563EB]"
      >
        <ArrowLeft className="h-4 w-4" />
        Тапсырыстар тізіміне оралу
      </Link>

      <OrderDetailClient
        viewerRole={user.role === "ADMIN" ? "ADMIN" : "PROVIDER"}
        order={{
          id: order.id,
          status: order.status,
          description: order.description,
          address: order.address,
          preferredDate: order.preferredDate,
          preferredTime: order.preferredTime,
          agreedPrice: order.agreedPrice ? Number(order.agreedPrice) : null,
          agreedDateTime: order.agreedDateTime,
          agreedScope: order.agreedScope,
          customerConfirmed: order.customerConfirmed,
          providerConfirmed: order.providerConfirmed,
          createdAt: order.createdAt.toISOString(),
          categoryName: order.category.nameKk,
          customerName: order.customer.name,
          providerName: order.provider.user.name,
          providerId: order.provider.id,
          negotiations: order.negotiations.map((n) => ({
            id: n.id,
            proposedByName: n.proposedBy.name,
            proposedPrice: Number(n.proposedPrice),
            proposedDateTime: n.proposedDateTime,
            proposedScope: n.proposedScope,
            status: n.status,
            createdAt: n.createdAt.toISOString(),
          })),
          review: order.review
            ? {
                id: order.review.id,
                rating: order.review.rating,
                comment: order.review.comment,
                createdAt: order.review.createdAt.toISOString(),
              }
            : null,
        }}
      />
    </div>
  );
}

