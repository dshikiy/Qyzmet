import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { SignOutButton } from "./sign-out-button";

export async function Header() {
  const user = await getCurrentUser();

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "PROVIDER"
        ? "/provider/dashboard"
        : "/dashboard";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E2E8F0] bg-white/95 backdrop-blur-sm">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-md"
        >
          Qyzmet<span className="text-[#2563EB]">Tap</span>
        </Link>

        <nav
          aria-label="Негізгі навигация"
          className="hidden md:flex items-center gap-1"
        >
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-colors"
          >
            Басты бет
          </Link>
          <Link
            href="/services"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-colors"
          >
            Қызметтер
          </Link>
          <Link
            href="/providers"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-colors"
          >
            Мамандар
          </Link>
          <Link
            href="/map"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] hover:text-[#2563EB] transition-colors"
          >
            Карта
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              <Link href={dashboardHref}>
                <Button variant="secondary" size="sm">
                  {user.name}
                </Button>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Кіру
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Тіркелу</Button>
              </Link>
            </>
          )}
        </div>

        <MobileNav
          user={user ? { name: user.name, role: user.role } : null}
          dashboardHref={dashboardHref}
        />
      </div>
    </header>
  );
}

