import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Әкімші панелі",
  robots: { index: false, follow: false },
};

const ADMIN_NAV = [
  { href: "/admin", label: "Шолу" },
  { href: "/admin/users", label: "Пайдаланушылар" },
  { href: "/admin/providers", label: "Мамандар" },
  { href: "/admin/categories", label: "Санаттар" },
  { href: "/admin/orders", label: "Тапсырыстар" },
  { href: "/admin/reviews", label: "Пікірлер" },
  { href: "/admin/promotions", label: "Монетизация" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["ADMIN"]);

  return (
    <DashboardShell
      title="Әкімші панелі"
      subtitle={`Жүйе әкімшісі: ${user.name}`}
      navItems={ADMIN_NAV}
    >
      {children}
    </DashboardShell>
  );
}

