import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ShieldCheck, Handshake, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "QyzmetTap туралы",
  description:
    "QyzmetTap — Қазақстандағы сенімді мамандарды жақын жерден табуға арналған онлайн платформа.",
};

export default function AboutPage() {
  return (
    <div className="container-app py-12 sm:py-16 space-y-12">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">
          QyzmetTap туралы
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-[#64748B]">
          QyzmetTap — Қазақстан тұрғындарына жақын маңдағы сенімді мамандарды
          жылдам табуға арналған қызметтер платформасы. Алғашқы қаламыз — Ақтау,
          алдағы уақытта еліміздің басқа қалаларын да қамтимыз.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3">
          <MapPin className="h-6 w-6 text-[#2563EB]" />
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Геолокация арқылы іздеу
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Өз ауданыңызға жақын электрик, сантехник, репетитор, үй тазалау және
            техника жөндеу мамандарын картадан оңай табасыз.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3">
          <Handshake className="h-6 w-6 text-[#2563EB]" />
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Ашық келісім шарттары
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Жұмыс басталмас бұрын тапсырыс беруші мен маман нақты бағаны, келу
            уақытын және жұмыс көлемін өзара растайды.
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 space-y-3">
          <Star className="h-6 w-6 text-[#2563EB]" />
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Шынайы пікірлер мен рейтинг
          </h2>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Пікірді тек нақты аяқталған тапсырысы бар тапсырыс беруші ғана
            қалдыра алады.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E40AF]">
            <ShieldCheck className="h-5 w-5" />
            <span>Қазір бастаңыз</span>
          </div>
          <p className="text-sm text-[#334155]">
            Қажетті маманды табыңыз немесе өз қызметтеріңізді ұсыну үшін
            тіркеліңіз.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/providers">
            <Button>Маман табу</Button>
          </Link>
          <Link href="/register?role=PROVIDER">
            <Button variant="outline">Маман болып тіркелу</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

