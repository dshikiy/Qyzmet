"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole =
    searchParams.get("role") === "PROVIDER" ? "PROVIDER" : "CUSTOMER";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "PROVIDER">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Тіркелу кезінде қате орын алды.");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
        return;
      }

      router.push(role === "PROVIDER" ? "/provider/profile" : "/dashboard");
      router.refresh();
    } catch {
      setError("Тіркелу кезінде қате орын алды.");
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Тіркелу</CardTitle>
        <CardDescription>
          QyzmetTap платформасында жаңа аккаунт ашыңыз
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
            <span className="block text-sm font-medium text-[#0F172A]">
              Аккаунт түрі
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole("CUSTOMER")}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  role === "CUSTOMER"
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF]"
                    : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                Тапсырыс беруші
              </button>
              <button
                type="button"
                onClick={() => setRole("PROVIDER")}
                className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  role === "PROVIDER"
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF]"
                    : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                Маман
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Толық аты-жөніңіз
            </label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              placeholder="Айдос Серікұлы"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Электрондық пошта
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@example.kz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Құпиясөз
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Кемінде 8 таңба"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Тіркелуде..." : "Тіркелу"}
          </Button>

          <p className="text-center text-sm text-[#64748B]">
            Аккаунтыңыз бар ма?{" "}
            <Link
              href="/login"
              className="font-medium text-[#2563EB] hover:underline"
            >
              Кіру
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

