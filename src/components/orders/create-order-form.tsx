"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CreateOrderFormProps {
  providerId: string;
  providerName: string;
  categories: { id: string; nameKk: string }[];
  isAuthenticated: boolean;
  isOwnProfile: boolean;
}

export function CreateOrderForm({
  providerId,
  providerName,
  categories,
  isAuthenticated,
  isOwnProfile,
}: CreateOrderFormProps) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("10:00");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isOwnProfile) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-[#64748B]">
          Бұл сіздің жеке маман профиліңіз. Өзгерістер енгізу үшін{" "}
          <Link href="/provider/profile" className="font-medium text-[#2563EB] hover:underline">
            профиль баптауларына
          </Link>{" "}
          өтіңіз.
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Тапсырыс беру</CardTitle>
          <CardDescription>
            {providerName} маманына өтінім жіберу үшін жүйеге кіріңіз немесе тіркеліңіз.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2.5">
          <Link href="/login">
            <Button className="w-full">Кіру</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" className="w-full">
              Тіркелу
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          categoryId,
          description,
          address,
          preferredDate,
          preferredTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Өтінім жіберу кезінде қате орын алды.");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/orders/${data.order.id}`);
      router.refresh();
    } catch {
      setError("Өтінім жіберу кезінде қате орын алды.");
      setLoading(false);
    }
  }

  return (
    <Card id="order-form">
      <CardHeader>
        <CardTitle>Тапсырыс беру</CardTitle>
        <CardDescription>
          Мәселені сипаттап, қалаулы уақытты көрсетіңіз. Маманмен баға мен
          шарттарды келесі қадамда келісесіз.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-sm text-[#B91C1C]"
            >
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="categoryId" className="block text-sm font-medium text-[#0F172A]">
              Қызмет санаты
            </label>
            <Select
              id="categoryId"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameKk}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-[#0F172A]">
              Мәселенің сипаттамасы
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              placeholder="Қандай жұмыс орындау қажет екенін толығырақ жазыңыз..."
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="address" className="block text-sm font-medium text-[#0F172A]">
              Қызмет көрсету мекенжайы
            </label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              minLength={5}
              placeholder="Мысалы: Ақтау, 14-шағын аудан, 25-үй, 12-пәтер"
            />
            <p className="text-xs text-[#64748B]">
              Мекенжайыңыз тек таңдалған маманға ғана көрінеді.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="preferredDate" className="block text-sm font-medium text-[#0F172A]">
                Қалаулы күн
              </label>
              <Input
                id="preferredDate"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="preferredTime" className="block text-sm font-medium text-[#0F172A]">
                Қалаулы уақыт
              </label>
              <Input
                id="preferredTime"
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Жіберілуде..." : "Тапсырыс беру"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

