import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export interface DashboardNavItem {
  href: string;
  label: string;
}

interface DashboardShellProps {
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem[];
  children: React.ReactNode;
}

export async function DashboardShell({
  title,
  subtitle,
  navItems,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container-app flex-1 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className="lg:col-span-3">
            <nav
              aria-label="Кабинет мәзірі"
              className="flex lg:flex-col gap-1 overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white p-2"
            >
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap rounded-lg px-3.5 py-2.5 text-sm font-medium text-[#334155] hover:bg-[#EFF6FF] hover:text-[#1E40AF] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="lg:col-span-9 min-w-0 space-y-6">{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

