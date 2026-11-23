import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/services", "/providers", "/map", "/about"],
      disallow: ["/dashboard", "/provider", "/admin", "/api", "/login", "/register"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

