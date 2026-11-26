import { NextRequest, NextResponse } from "next/server";
import { getProvidersForMap, searchProviders } from "@/server/services/providers";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const isMap = sp.get("map") === "1";

    if (isMap) {
      const items = await getProvidersForMap(
        sp.get("category") || undefined,
        sp.get("city") || undefined
      );
      return NextResponse.json({ items, total: items.length });
    }

    const sortParam = sp.get("sort");
    const sort =
      sortParam === "distance" ||
      sortParam === "price_asc" ||
      sortParam === "price_desc" ||
      sortParam === "rating"
        ? sortParam
        : undefined;

    const minRatingRaw = sp.get("minRating");
    const maxPriceRaw = sp.get("maxPrice");
    const latRaw = sp.get("lat");
    const lngRaw = sp.get("lng");
    const pageRaw = sp.get("page");

    const result = await searchProviders({
      q: sp.get("q") || undefined,
      categorySlug: sp.get("category") || undefined,
      city: sp.get("city") || undefined,
      minRating: minRatingRaw ? Number(minRatingRaw) : undefined,
      maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined,
      sort,
      lat: latRaw ? Number(latRaw) : undefined,
      lng: lngRaw ? Number(lngRaw) : undefined,
      page: pageRaw ? Number(pageRaw) : 1,
      pageSize: 20,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search providers API error:", error);
    return NextResponse.json({ error: "Мамандарды жүктеу сәтсіз аяқталды." }, { status: 500 });
  }
}

