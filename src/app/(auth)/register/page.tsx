import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Тіркелу",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "PROVIDER") redirect("/provider/dashboard");
    redirect("/dashboard");
  }

  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

