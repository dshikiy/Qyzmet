"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatDateKk, formatKzt } from "@/lib/utils/format";

export interface OrderDetailData {
  id: string;
  status: OrderStatus;
  description: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  agreedPrice: number | null;
  agreedDateTime: string | null;
  agreedScope: string | null;
  customerConfirmed: boolean;
  providerConfirmed: boolean;
  createdAt: string;
  categoryName: string;
  customerName: string;
  providerName: string;
  providerId: string;
  negotiations: {
    id: string;
    proposedByName: string;
    proposedPrice: number;
    proposedDateTime: string;
    proposedScope: string;
    status: string;
    createdAt: string;
  }[];
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
}

interface OrderDetailClientProps {
  order: OrderDetailData;
  viewerRole: "CUSTOMER" | "PROVIDER" | "ADMIN";
}

export function OrderDetailClient({ order, viewerRole }: OrderDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Negotiation form
  const [proposedPrice, setProposedPrice] = useState(
    order.agreedPrice ? String(order.agreedPrice) : ""
  );
  const [proposedDateTime, setProposedDateTime] = useState(
    order.agreedDateTime || `${order.preferredDate} ${order.preferredTime}`
  );
  const [proposedScope, setProposedScope] = useState(
    order.agreedScope || order.description
  );

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  async function updateStatus(status: OrderStatus) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Қате орын алды.");
      } else {
        setSuccess("Тапсырыс күйі жаңартылды.");
        router.refresh();
      }
    } catch {
      setError("Желі қатесі.");
    } finally {
      setLoading(false);
    }
  }

  async function submitProposal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/negotiations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedPrice: Number(proposedPrice),
          proposedDateTime,
          proposedScope,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ұсыныс жіберілмеді.");
      } else {
        setSuccess("Шарттар бойынша ұсыныс жіберілді.");
        router.refresh();
      }
    } catch {
      setError("Желі қатесі.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmTerms() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/negotiations`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Растау кезінде қате орын алды.");
      } else {
        setSuccess("Шарттар расталды!");
        router.refresh();
      }
    } catch {
      setError("Желі қатесі.");
    } finally {
      setLoading(false);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Пікір жіберілмеді.");
      } else {
        setSuccess("Пікіріңіз сәтті сақталды!");
        router.refresh();
      }
    } catch {
      setError("Желі қатесі.");
    } finally {
      setLoading(false);
    }
  }

  const canConfirm =
    order.status === "NEGOTIATING" &&
    ((viewerRole === "CUSTOMER" && !order.customerConfirmed) ||
      (viewerRole === "PROVIDER" && !order.providerConfirmed));

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#B91C1C]"
        >
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#15803D]">
          {success}
        </div>
      )}

      {/* Main order info */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{order.categoryName}</CardTitle>
            <CardDescription className="mt-1">
              Тапсырыс #{order.id.slice(-8)} · {formatDateKk(order.createdAt)}
            </CardDescription>
          </div>
          <OrderStatusBadge status={order.status} />
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
            <div>
              <p className="text-xs text-[#64748B]">Тапсырыс беруші</p>
              <p className="font-medium text-[#0F172A] mt-0.5">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Маман</p>
              <p className="font-medium text-[#0F172A] mt-0.5">{order.providerName}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Қалаулы уақыт</p>
              <p className="font-medium text-[#0F172A] mt-0.5">
                {order.preferredDate}, {order.preferredTime}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Мекенжай</p>
              <p className="font-medium text-[#0F172A] mt-0.5">{order.address}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#64748B]">Мәселенің сипаттамасы</p>
            <p className="mt-1 text-[#334155] whitespace-pre-line">{order.description}</p>
          </div>

          {/* Action buttons based on status */}
          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-[#E2E8F0]">
            {order.status === "PENDING" && viewerRole === "PROVIDER" && (
              <>
                <Button
                  type="button"
                  disabled={loading}
                  onClick={() => updateStatus("NEGOTIATING")}
                >
                  Өтінімді қабылдау
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={loading}
                  onClick={() => updateStatus("REJECTED")}
                >
                  Қабылдамау
                </Button>
              </>
            )}

            {order.status === "AGREED" && viewerRole === "PROVIDER" && (
              <Button
                type="button"
                disabled={loading}
                onClick={() => updateStatus("IN_PROGRESS")}
              >
                Жұмысты бастау
              </Button>
            )}

            {order.status === "IN_PROGRESS" &&
              (viewerRole === "PROVIDER" || viewerRole === "CUSTOMER") && (
                <Button
                  type="button"
                  variant="success"
                  disabled={loading}
                  onClick={() => updateStatus("COMPLETED")}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Қызметті аяқтау
                </Button>
              )}

            {(order.status === "PENDING" ||
              order.status === "NEGOTIATING" ||
              order.status === "AGREED") && (
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => updateStatus("CANCELLED")}
              >
                Бас тарту
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agreed / Current Terms */}
      {order.agreedPrice !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Келісілген шарттар</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#64748B]">Бағасы</p>
                <p className="text-lg font-bold text-[#0F172A]">
                  {formatKzt(order.agreedPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Келу күні мен уақыты</p>
                <p className="font-medium text-[#0F172A] mt-0.5">
                  {order.agreedDateTime}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Жұмыс көлемі</p>
              <p className="mt-1 text-[#334155] whitespace-pre-line">
                {order.agreedScope}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2 text-xs">
              <span
                className={
                  order.customerConfirmed ? "text-[#16A34A] font-medium" : "text-[#64748B]"
                }
              >
                Тапсырыс беруші:{" "}
                {order.customerConfirmed ? "Растады ✓" : "Растау күтілуде"}
              </span>
              <span
                className={
                  order.providerConfirmed ? "text-[#16A34A] font-medium" : "text-[#64748B]"
                }
              >
                Маман: {order.providerConfirmed ? "Растады ✓" : "Растау күтілуде"}
              </span>
            </div>

            {canConfirm && (
              <div className="pt-2">
                <Button type="button" onClick={confirmTerms} disabled={loading}>
                  Шарттарды растау
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Negotiation Proposal Form */}
      {(order.status === "PENDING" || order.status === "NEGOTIATING") &&
        viewerRole !== "ADMIN" && (
          <Card>
            <CardHeader>
              <CardTitle>Шарттарды ұсыну / нақтылау</CardTitle>
              <CardDescription>
                Қорытынды баға, келу уақыты және жұмыс көлемі бойынша ұсыныс
                жіберіңіз. Екі тарап растағаннан кейін тапсырыс «Келісілді»
                күйіне өтеді.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitProposal} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="proposedPrice"
                      className="block text-sm font-medium text-[#0F172A]"
                    >
                      Ұсынылатын баға (₸)
                    </label>
                    <Input
                      id="proposedPrice"
                      type="number"
                      min={1}
                      required
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      placeholder="15000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="proposedDateTime"
                      className="block text-sm font-medium text-[#0F172A]"
                    >
                      Келу күні мен уақыты
                    </label>
                    <Input
                      id="proposedDateTime"
                      required
                      value={proposedDateTime}
                      onChange={(e) => setProposedDateTime(e.target.value)}
                      placeholder="2026-11-25 14:00"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="proposedScope"
                    className="block text-sm font-medium text-[#0F172A]"
                  >
                    Жұмыс көлемі
                  </label>
                  <Textarea
                    id="proposedScope"
                    required
                    minLength={5}
                    value={proposedScope}
                    onChange={(e) => setProposedScope(e.target.value)}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Жіберілуде..." : "Ұсыныс жіберу"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

      {/* Negotiation History */}
      {order.negotiations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Келіссөз тарихы</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.negotiations.map((n) => (
              <div
                key={n.id}
                className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-sm space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#0F172A]">
                    {n.proposedByName}
                  </span>
                  <span className="text-xs text-[#64748B]">
                    {formatDateKk(n.createdAt)} · {n.status}
                  </span>
                </div>
                <p className="font-medium text-[#1E40AF]">
                  {formatKzt(n.proposedPrice)} · {n.proposedDateTime}
                </p>
                <p className="text-[#334155]">{n.proposedScope}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Review Section */}
      {order.status === "COMPLETED" && (
        <Card>
          <CardHeader>
            <CardTitle>Пікір және баға</CardTitle>
          </CardHeader>
          <CardContent>
            {order.review ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="font-semibold text-[#0F172A]">
                    {order.review.rating}.0 / 5
                  </span>
                </div>
                <p className="text-[#334155]">{order.review.comment}</p>
              </div>
            ) : viewerRole === "CUSTOMER" ? (
              <form onSubmit={submitReview} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#0F172A]">
                    Баға (1–5)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold cursor-pointer ${
                          rating >= num
                            ? "border-[#F59E0B] bg-[#FFFBEB] text-[#B45309]"
                            : "border-[#E2E8F0] bg-white text-[#64748B]"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="reviewComment"
                    className="block text-sm font-medium text-[#0F172A]"
                  >
                    Пікіріңіз
                  </label>
                  <Textarea
                    id="reviewComment"
                    required
                    minLength={5}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Маманның жұмысы туралы пікіріңізді жазыңыз..."
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  Пікір қалдыру
                </Button>
              </form>
            ) : (
              <p className="text-sm text-[#64748B]">
                Тапсырыс беруші әлі пікір қалдырмаған.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

