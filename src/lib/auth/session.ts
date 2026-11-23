import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { auth } from "./auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "ADMIN") redirect("/admin");
    if (user.role === "PROVIDER") redirect("/provider/dashboard");
    redirect("/dashboard");
  }
  return user;
}

