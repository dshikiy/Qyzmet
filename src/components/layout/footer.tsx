import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export async function Footer() {
  const categories = await prisma.serviceCategory
    .findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 6,
    })
    .catch(() => []);

  return (
    <footer className="mt-auto border-t border-[#E2E8F0] bg-white">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-[#0F172A]"
            >
              Qyzmet<span className="text-[#2563EB]">Tap</span>
            </Link>
            <p className="text-sm leading-relaxed text-[#64748B]">
              Қазақстандағы сенімді мамандарды жақын жерден жылдам табуға
              арналған қызметтер платформасы.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">Навигация</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
              <li>
                <Link href="/" className="hover:text-[#2563EB] transition-colors">
                  Басты бет
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Қызметтер
                </Link>
              </li>
              <li>
                <Link
                  href="/providers"
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Мамандар
                </Link>
              </li>
              <li>
                <Link
                  href="/map"
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Карта
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[#2563EB] transition-colors"
                >
                  QyzmetTap туралы
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Қызмет санаттары
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/services/${cat.slug}`}
                    className="hover:text-[#2563EB] transition-colors"
                  >
                    {cat.nameKk}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#0F172A]">
              Платформа
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-[#64748B]">
              <li>
                <Link
                  href="/register"
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Тапсырыс беруші болу
                </Link>
              </li>
              <li>
                <Link
                  href="/register?role=PROVIDER"
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Маман ретінде тіркелу
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-[#2563EB] transition-colors"
                >
                  Жеке кабинетке кіру
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[#E2E8F0] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <p>© {new Date().getFullYear()} QyzmetTap. Барлық құқықтар қорғалған.</p>
          <p>Ақтау, Қазақстан</p>
        </div>
      </div>
    </footer>
  );
}

