import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const categories = await prisma.serviceCategory
    .findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })
    .catch(() => []);

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/services`, lastModified: new Date() },
    { url: `${baseUrl}/providers`, lastModified: new Date() },
    { url: `${baseUrl}/map`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    ...categories.map((c) => ({
      url: `${baseUrl}/services/${c.slug}`,
      lastModified: c.updatedAt,
    })),
  ];
}

