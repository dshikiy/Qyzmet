"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KAZAKHSTAN_CITIES, DEFAULT_CITY } from "@/constants/cities";

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(DEFAULT_CITY.nameKk);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (city) params.set("city", city);
    router.push(`/providers?${params.toString()}`);
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      setGeoError("Браузеріңіз геолокацияны қолдамайды.");
      return;
    }
    setGeoError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        params.set("lat", pos.coords.latitude.toFixed(6));
        params.set("lng", pos.coords.longitude.toFixed(6));
        params.set("sort", "distance");
        router.push(`/providers?${params.toString()}`);
      },
      () => {
        setLocating(false);
        setGeoError("Орналасқан жерді анықтау мүмкін болмады. Қаланы қолмен таңдаңыз.");
      },
      { timeout: 8000 }
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl border border-[#E2E8F0] bg-white p-2 shadow-sm"
      >
        <div className="relative flex-1 flex items-center">
          <Search
            className="pointer-events-none absolute left-3.5 h-5 w-5 text-[#94A3B8]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Қандай қызмет қажет?"
            aria-label="Қандай қызмет қажет?"
            className="h-12 w-full rounded-xl bg-transparent pl-11 pr-3 text-sm sm:text-base text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
          />
        </div>

        <div className="hidden sm:block w-px bg-[#E2E8F0] my-2" />

        <div className="relative flex items-center sm:w-44">
          <MapPin
            className="pointer-events-none absolute left-3 h-4 w-4 text-[#2563EB]"
            aria-hidden="true"
          />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            aria-label="Қаланы таңдау"
            className="h-12 w-full appearance-none rounded-xl bg-[#F8FAFC] sm:bg-transparent pl-9 pr-7 text-sm font-medium text-[#0F172A] focus:outline-none cursor-pointer"
          >
            {KAZAKHSTAN_CITIES.map((c) => (
              <option key={c.slug} value={c.nameKk}>
                {c.nameKk}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" size="lg" className="h-12 px-7 shrink-0">
          Маман табу
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#64748B]">
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="inline-flex items-center gap-1.5 font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors cursor-pointer disabled:opacity-50"
        >
          <LocateFixed className="h-3.5 w-3.5" aria-hidden="true" />
          {locating ? "Анықталуда..." : "Жақын маңдағы мамандарды анықтау"}
        </button>
        {geoError && <span className="text-[#DC2626]">{geoError}</span>}
      </div>
    </div>
  );
}

