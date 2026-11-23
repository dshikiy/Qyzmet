"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import maplibregl from "maplibre-gl";
import { LocateFixed, MapPin, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_CITY, KAZAKHSTAN_CITIES } from "@/constants/cities";
import { formatKzt, formatRating } from "@/lib/utils/format";

export interface MapProviderItem {
  id: string;
  name: string;
  city: string;
  publicLocation: string;
  latitude: number;
  longitude: number;
  indicativePrice: number;
  isPremium: boolean;
  categories: { id: string; nameKk: string; slug: string }[];
  averageRating: number;
  reviewCount: number;
}

interface ProviderMapProps {
  providers: MapProviderItem[];
  categories: { id: string; nameKk: string; slug: string }[];
  initialCategory?: string;
}

export function ProviderMap({
  providers,
  categories,
  initialCategory = "",
}: ProviderMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITY.nameKk);
  const [selectedProvider, setSelectedProvider] =
    useState<MapProviderItem | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const filteredProviders = providers.filter((p) => {
    const matchCity =
      !selectedCity ||
      selectedCity === "Барлық қалалар" ||
      p.city.toLowerCase() === selectedCity.toLowerCase();
    const matchCat =
      !selectedCategory ||
      p.categories.some((c) => c.slug === selectedCategory);
    return matchCity && matchCat;
  });

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [DEFAULT_CITY.longitude, DEFAULT_CITY.latitude],
      zoom: 12,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredProviders.forEach((provider) => {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `${provider.name} — ${provider.publicLocation}`);
      el.className =
        "flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#2563EB] text-white shadow-md hover:bg-[#1D4ED8] transition-transform cursor-pointer";
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;

      el.addEventListener("click", () => {
        setSelectedProvider(provider);
        map.flyTo({
          center: [provider.longitude, provider.latitude],
          zoom: Math.max(map.getZoom(), 13),
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([provider.longitude, provider.latitude])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [filteredProviders]);

  function handleCityChange(cityName: string) {
    setSelectedCity(cityName);
    const cityObj = KAZAKHSTAN_CITIES.find((c) => c.nameKk === cityName);
    if (cityObj && mapRef.current) {
      mapRef.current.flyTo({
        center: [cityObj.longitude, cityObj.latitude],
        zoom: 12,
      });
    }
  }

  function handleLocateMe() {
    if (!navigator.geolocation) {
      setGeoStatus("Браузеріңіз геолокацияны қолдамайды.");
      return;
    }
    setGeoStatus("Орналасу анықталуда...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoStatus(null);
        const map = mapRef.current;
        if (map) {
          map.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 13,
          });
          new maplibregl.Marker({ color: "#16A34A" })
            .setLngLat([pos.coords.longitude, pos.coords.latitude])
            .addTo(map);
        }
      },
      () => {
        setGeoStatus("Геолокацияға рұқсат берілмеді.");
      },
      { timeout: 8000 }
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-3.5">
        <Select
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          aria-label="Қаланы таңдау"
          className="sm:w-48"
        >
          <option value="Барлық қалалар">Барлық қалалар</option>
          {KAZAKHSTAN_CITIES.map((c) => (
            <option key={c.slug} value={c.nameKk}>
              {c.nameKk}
            </option>
          ))}
        </Select>

        <Select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Санатты таңдау"
          className="sm:w-56"
        >
          <option value="">Барлық санаттар</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.nameKk}
            </option>
          ))}
        </Select>

        <Button
          type="button"
          variant="secondary"
          onClick={handleLocateMe}
          className="sm:ml-auto"
        >
          <LocateFixed className="h-4 w-4" />
          Менің орным
        </Button>
      </div>

      {geoStatus && (
        <p className="text-xs text-[#64748B]">{geoStatus}</p>
      )}

      <div className="relative h-[520px] sm:h-[600px] w-full overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#EFF6FF]">
        <div ref={mapContainerRef} className="h-full w-full" />

        {selectedProvider && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-10 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-lg space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-[#0F172A]">
                  {selectedProvider.name}
                </h3>
                <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {selectedProvider.city}, {selectedProvider.publicLocation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
                aria-label="Жабу"
                className="rounded-md p-1 text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {selectedProvider.categories.map((c) => (
                <Badge key={c.id} variant="secondary">
                  {c.nameKk}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-1 font-medium text-[#0F172A]">
                <Star className="h-4 w-4 text-[#F59E0B] fill-[#F59E0B]" />
                {formatRating(selectedProvider.averageRating)} (
                {selectedProvider.reviewCount})
              </span>
              <span className="font-semibold text-[#0F172A]">
                {formatKzt(selectedProvider.indicativePrice)}
              </span>
            </div>

            <Link href={`/providers/${selectedProvider.id}`} className="block">
              <Button className="w-full" size="sm">
                Профильді ашу
              </Button>
            </Link>
          </div>
        )}
      </div>

      <p className="text-xs text-[#64748B]">
        Картада көрсетілген мамандар саны: {filteredProviders.length}. Карта
        деректері © OpenStreetMap.
      </p>
    </div>
  );
}

