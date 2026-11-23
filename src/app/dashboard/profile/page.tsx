import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { CustomerProfileForm } from "@/components/dashboard/customer-profile-form";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const sessionUser = await requireRole(["CUSTOMER", "ADMIN"]);
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { name: true, email: true },
  });

  if (!user) return null;

  return <CustomerProfileForm initialName={user.name} email={user.email} />;
}

