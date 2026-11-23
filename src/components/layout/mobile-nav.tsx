"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  user: {
    name: string;
    role: UserRole;
  } | null;
  dashboardHref: string;
}

export function MobileNav({ user, dashboardHref }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Мәзірді жабу" : "Мәзірді ашу"}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#F8FAFC]"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-x-0 top-16 z-50 border-b border-[#E2E8F0] bg-white shadow-lg">
          <nav className="container-app flex flex-col gap-1 py-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              Басты бет
            </Link>
            <Link
              href="/services"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              Қызметтер
            </Link>
            <Link
              href="/providers"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              Мамандар
            </Link>
            <Link
              href="/map"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              Карта
            </Link>
            <Link
              href="/about"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC]"
            >
              Біз туралы
            </Link>

            <div className="my-2 border-t border-[#E2E8F0]" />

            {user ? (
              <div className="flex flex-col gap-2 pt-1">
                <Link href={dashboardHref} onClick={() => setOpen(false)}>
                  <Button className="w-full">Жеке кабинет ({user.name})</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Кіру
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full">Тіркелу</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

