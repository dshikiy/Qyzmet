import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Кіру",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "PROVIDER") redirect("/provider/dashboard");
    redirect("/dashboard");
  }

  return <LoginForm />;
}

