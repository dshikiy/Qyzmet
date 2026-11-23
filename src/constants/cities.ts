export interface CityOption {
  nameKk: string;
  slug: string;
  latitude: number;
  longitude: number;
  isPrimary?: boolean;
}

export const KAZAKHSTAN_CITIES: CityOption[] = [
  {
    nameKk: "Ақтау",
    slug: "aktau",
    latitude: 43.6532,
    longitude: 51.1975,
    isPrimary: true,
  },
  {
    nameKk: "Жаңаөзен",
    slug: "zhanaozen",
    latitude: 43.3412,
    longitude: 52.8619,
  },
  {
    nameKk: "Атырау",
    slug: "atyrau",
    latitude: 47.0945,
    longitude: 51.9238,
  },
  {
    nameKk: "Алматы",
    slug: "almaty",
    latitude: 43.2389,
    longitude: 76.8897,
  },
  {
    nameKk: "Астана",
    slug: "astana",
    latitude: 51.1694,
    longitude: 71.4491,
  },
  {
    nameKk: "Шымкент",
    slug: "shymkent",
    latitude: 42.3417,
    longitude: 69.5901,
  },
];

export const DEFAULT_CITY = KAZAKHSTAN_CITIES[0];

export function getCityByName(name?: string | null): CityOption {
  if (!name) return DEFAULT_CITY;
  const found = KAZAKHSTAN_CITIES.find(
    (c) => c.nameKk.toLowerCase() === name.toLowerCase() || c.slug === name.toLowerCase()
  );
  return found ?? DEFAULT_CITY;
}

