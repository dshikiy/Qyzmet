import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export const metadata: Metadata = {
  title: "Маман кабинеті",
  robots: { index: false, follow: false },
};

const PROVIDER_NAV = [
  { href: "/provider/dashboard", label: "Шолу" },
  { href: "/provider/profile", label: "Кәсіби профиль" },
  { href: "/provider/orders", label: "Тапсырыстар" },
  { href: "/provider/reviews", label: "Пікірлер" },
];

export default async function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["PROVIDER", "ADMIN"]);

  return (
    <DashboardShell
      title="Маман кабинеті"
      subtitle={`Қош келдіңіз, ${user.name}`}
      navItems={PROVIDER_NAV}
    >
      {children}
    </DashboardShell>
  );
}

