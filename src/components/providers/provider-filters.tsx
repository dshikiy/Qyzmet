"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, LocateFixed, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { KAZAKHSTAN_CITIES } from "@/constants/cities";

interface ProviderFiltersProps {
  categories: { id: string; nameKk: string; slug: string }[];
}

export function ProviderFilters({ categories }: ProviderFiltersProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [category, setCategory] = useState(sp.get("category") ?? "");
  const [city, setCity] = useState(sp.get("city") ?? "");
  const [minRating, setMinRating] = useState(sp.get("minRating") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("maxPrice") ?? "");
  const [sort, setSort] = useState(sp.get("sort") ?? "rating");
  const [locating, setLocating] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  function applyFilters(overrides?: Record<string, string>) {
    const params = new URLSearchParams();
    const merged: Record<string, string> = {
      q,
      category,
      city,
      minRating,
      maxPrice,
      sort,
      lat: sp.get("lat") ?? "",
      lng: sp.get("lng") ?? "",
      ...overrides,
    };

    Object.entries(merged).forEach(([k, v]) => {
      if (v && v.trim() !== "") params.set(k, v.trim());
    });

    router.push(`/providers?${params.toString()}`);
  }

  function handleReset() {
    setQ("");
    setCategory("");
    setCity("");
    setMinRating("");
    setMaxPrice("");
    setSort("rating");
    setGeoMsg(null);
    router.push("/providers");
  }

  function handleGeolocate() {
    if (!navigator.geolocation) {
      setGeoMsg("Браузер геолокацияны қолдамайды.");
      return;
    }
    setLocating(true);
    setGeoMsg(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setSort("distance");
        applyFilters({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          sort: "distance",
        });
      },
      () => {
        setLocating(false);
        setGeoMsg("Орналасуды анықтау мүмкін болмады. Қаланы қолмен таңдаңыз.");
      },
      { timeout: 8000 }
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        applyFilters();
      }}
      className="rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
          <SlidersHorizontal className="h-4 w-4 text-[#2563EB]" />
          <span>Іздеу және сүзгі</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-medium text-[#64748B] hover:text-[#2563EB] cursor-pointer"
        >
          Тазарту
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#94A3B8]" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Маман аты немесе қызмет..."
            className="pl-9"
          />
        </div>

        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Санат"
        >
          <option value="">Барлық санаттар</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nameKk}
            </option>
          ))}
        </Select>

        <Select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="Қала"
        >
          <option value="">Барлық қалалар</option>
          {KAZAKHSTAN_CITIES.map((c) => (
            <option key={c.slug} value={c.nameKk}>
              {c.nameKk}
            </option>
          ))}
        </Select>

        <Select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          aria-label="Ең төменгі рейтинг"
        >
          <option value="">Кез келген рейтинг</option>
          <option value="4.5">4.5+ жұлдыз</option>
          <option value="4">4.0+ жұлдыз</option>
          <option value="3">3.0+ жұлдыз</option>
        </Select>

        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Сұрыптау"
        >
          <option value="rating">Рейтинг бойынша</option>
          <option value="price_asc">Баға: арзаннан қымбатқа</option>
          <option value="price_desc">Баға: қымбаттан арзанға</option>
          <option value="distance">Қашықтық бойынша</option>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Input
              type="number"
              min={0}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Макс. баға (₸)"
              aria-label="Максималды бағдарлы баға"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGeolocate}
            disabled={locating}
          >
            <LocateFixed className="h-4 w-4" />
            {locating ? "Анықталуда..." : "Жақын мамандарды табу"}
          </Button>
          {geoMsg && <span className="text-xs text-[#DC2626]">{geoMsg}</span>}
        </div>

        <Button type="submit">Іздеу</Button>
      </div>
    </form>
  );
}

