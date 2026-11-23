import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Тапсырыс беруші кабинеті",
  robots: { index: false, follow: false },
};

const CUSTOMER_NAV = [
  { href: "/dashboard", label: "Шолу" },
  { href: "/dashboard/orders", label: "Менің тапсырыстарым" },
  { href: "/dashboard/profile", label: "Профиль" },
];

export default async function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["CUSTOMER", "ADMIN"]);

  return (
    <DashboardShell
      title="Жеке кабинет"
      subtitle={`Қош келдіңіз, ${user.name}`}
      navItems={CUSTOMER_NAV}
    >
      {children}
    </DashboardShell>
  );
}

