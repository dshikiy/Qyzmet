import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { ProviderProfileForm } from "@/components/dashboard/provider-profile-form";
import { DEFAULT_CITY } from "@/constants/cities";

export const dynamic = "force-dynamic";

export default async function ProviderProfileEditPage() {
  const user = await requireRole(["PROVIDER", "ADMIN"]);

  const [profile, categories, dbUser] = await Promise.all([
    prisma.providerProfile.findUnique({
      where: { userId: user.id },
      include: { categories: { select: { categoryId: true } } },
    }),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, nameKk: true },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { name: true },
    }),
  ]);

  return (
    <ProviderProfileForm
      categories={categories}
      initialData={{
        name: dbUser?.name ?? user.name,
        description: profile?.description ?? "",
        experience: profile?.experience ?? "",
        city: profile?.city ?? DEFAULT_CITY.nameKk,
        publicLocation: profile?.publicLocation ?? DEFAULT_CITY.nameKk,
        latitude: profile?.latitude ?? DEFAULT_CITY.latitude,
        longitude: profile?.longitude ?? DEFAULT_CITY.longitude,
        indicativePrice: profile ? Number(profile.indicativePrice) : 0,
        categoryIds: profile?.categories.map((c) => c.categoryId) ?? [],
      }}
    />
  );
}

