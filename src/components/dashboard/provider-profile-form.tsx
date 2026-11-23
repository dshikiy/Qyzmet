"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KAZAKHSTAN_CITIES } from "@/constants/cities";

interface ProviderProfileFormProps {
  initialData: {
    name: string;
    description: string;
    experience: string;
    city: string;
    publicLocation: string;
    latitude: number | null;
    longitude: number | null;
    indicativePrice: number;
    categoryIds: string[];
  };
  categories: { id: string; nameKk: string }[];
}

export function ProviderProfileForm({
  initialData,
  categories,
}: ProviderProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description);
  const [experience, setExperience] = useState(initialData.experience);
  const [city, setCity] = useState(initialData.city);
  const [publicLocation, setPublicLocation] = useState(initialData.publicLocation);
  const [latitude, setLatitude] = useState(
    initialData.latitude != null ? String(initialData.latitude) : ""
  );
  const [longitude, setLongitude] = useState(
    initialData.longitude != null ? String(initialData.longitude) : ""
  );
  const [indicativePrice, setIndicativePrice] = useState(
    String(initialData.indicativePrice || "")
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData.categoryIds
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function handleDetectLocation() {
    if (!navigator.geolocation) {
      setError("Браузеріңіз геолокацияны қолдамайды.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      () => setError("Орналасуды анықтау мүмкін болмады.")
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch("/api/provider/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          experience,
          city,
          publicLocation,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          indicativePrice: Number(indicativePrice || 0),
          categoryIds: selectedCategories,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Профильді сақтау кезінде қате орын алды.");
      } else {
        setMessage("Маман профилі сәтті сақталды!");
        router.refresh();
      }
    } catch {
      setError("Желі қатесі.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Кәсіби профильді өңдеу</CardTitle>
        <CardDescription>
          Бұл ақпарат тапсырыс берушілерге каталогта және картада көрсетіледі.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-sm text-[#B91C1C]">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-2.5 text-sm text-[#15803D]">
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-[#0F172A]">
                Аты-жөніңіз
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="indicativePrice"
                className="block text-sm font-medium text-[#0F172A]"
              >
                Бағдарлы баға (₸)
              </label>
              <Input
                id="indicativePrice"
                type="number"
                min={0}
                step={500}
                value={indicativePrice}
                onChange={(e) => setIndicativePrice(e.target.value)}
                required
                placeholder="5000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-medium text-[#0F172A]">
              Қызмет санаттары (кемінде біреуін таңдаңыз)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const active = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? "border-[#2563EB] bg-[#EFF6FF] text-[#1E40AF]"
                        : "border-[#E2E8F0] bg-white text-[#475569] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {cat.nameKk}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="experience"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Жұмыс тәжірибесі
            </label>
            <Input
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
              placeholder="Мысалы: 5 жыл тәжірибе, тұрғын үй және коммерциялық нысандар"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-[#0F172A]"
            >
              Қызметтер сипаттамасы
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              placeholder="Қандай жұмыстарды орындайтыныңызды толық жазыңыз..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="city" className="block text-sm font-medium text-[#0F172A]">
                Қала
              </label>
              <Select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              >
                {KAZAKHSTAN_CITIES.map((c) => (
                  <option key={c.slug} value={c.nameKk}>
                    {c.nameKk}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="publicLocation"
                className="block text-sm font-medium text-[#0F172A]"
              >
                Қызмет көрсету ауданы (ашық көрсетіледі)
              </label>
              <Input
                id="publicLocation"
                value={publicLocation}
                onChange={(e) => setPublicLocation(e.target.value)}
                required
                placeholder="Мысалы: 14-шағын аудан"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-1.5">
              <label htmlFor="latitude" className="block text-xs font-medium text-[#64748B]">
                Ендік (Latitude)
              </label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="43.6532"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="longitude" className="block text-xs font-medium text-[#64748B]">
                Бойлық (Longitude)
              </label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="51.1975"
              />
            </div>
            <Button type="button" variant="secondary" onClick={handleDetectLocation}>
              <LocateFixed className="h-4 w-4" />
              Координатты анықтау
            </Button>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Сақталуда..." : "Профильді сақтау"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

