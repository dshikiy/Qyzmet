"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CustomerProfileForm({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Сақтау кезінде қате орын алды.");
      } else {
        setMessage("Профиль жаңартылды.");
        router.refresh();
      }
    } catch {
      setError("Желі қатесі.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Жеке деректер</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-sm text-[#B91C1C]">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-2.5 text-sm text-[#15803D]">
              {message}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-sm font-medium text-[#0F172A]">
              Аты-жөні
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#0F172A]">
              Электрондық пошта
            </label>
            <Input value={email} disabled />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Сақталуда..." : "Сақтау"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

