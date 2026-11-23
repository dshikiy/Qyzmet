import { Prisma, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const AKTAU_LOCATIONS = [
  { location: "4-шағын аудан", lat: 43.6481, lng: 51.1582 },
  { location: "7-шағын аудан", lat: 43.6534, lng: 51.1649 },
  { location: "11-шағын аудан", lat: 43.6578, lng: 51.1742 },
  { location: "14-шағын аудан", lat: 43.6495, lng: 51.1865 },
  { location: "17-шағын аудан", lat: 43.6642, lng: 51.1984 },
  { location: "27-шағын аудан", lat: 43.6712, lng: 51.1821 },
  { location: "29-шағын аудан", lat: 43.6685, lng: 51.2095 },
  { location: "32А-шағын аудан", lat: 43.6791, lng: 51.2153 },
];

const FIRST_NAMES = [
  "Айдос",
  "Бекзат",
  "Ерлан",
  "Нұрлан",
  "Серік",
  "Данияр",
  "Қайрат",
  "Марат",
  "Тимур",
  "Асхат",
  "Әлия",
  "Гүлнәр",
  "Мәдина",
  "Айнұр",
  "Жанар",
  "Бауыржан",
  "Олжас",
  "Руслан",
  "Самат",
  "Талғат",
];

const LAST_NAMES = [
  "Серікұлы",
  "Нұрланұлы",
  "Қасымов",
  "Әбдірахманов",
  "Жұмабеков",
  "Сүлейменов",
  "Байжанов",
  "Омаров",
  "Төлегенов",
  "Ермеков",
  "Мұратова",
  "Сәдуақасова",
  "Қалиева",
  "Ахметова",
  "Ибрагимова",
];

const EXPERIENCE_OPTIONS = [
  "3 жыл тәжірибе, кепілдікпен жұмыс істеймін",
  "5 жыл тәжірибе, үй және кеңсе нысандары",
  "7 жыл тәжірибе, сапалы әрі ұқыпты орындау",
  "4 жыл тәжірибе, уақытылы келу және таза жұмыс",
  "8 жыл тәжірибе, кез келген күрделіліктегі тапсырыстар",
];

function getCategoryPricing(slug: string): number[] {
  if (slug.includes("elektrik")) return [5000, 6000, 7500, 8000, 10000];
  if (slug.includes("santehnik")) return [6000, 7000, 8500, 9000, 12000];
  if (slug.includes("tazalau") || slug.includes("clean"))
    return [8000, 10000, 12000, 15000, 18000];
  if (slug.includes("repetitor") || slug.includes("tutor"))
    return [4000, 5000, 6000, 7000, 8000];
  if (slug.includes("tehnika") || slug.includes("repair"))
    return [5000, 7000, 8000, 10000, 12000];
  return [5000, 6500, 8000, 9500, 11000];
}

async function main() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (categories.length === 0) {
    console.error("No active categories found. Run npm run db:seed first.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash("Provider123!", 10);
  let createdOrUpdated = 0;

  for (let cIdx = 0; cIdx < categories.length; cIdx++) {
    const cat = categories[cIdx];
    const prices = getCategoryPricing(cat.slug);

    for (let i = 0; i < 5; i++) {
      const email = `demo.${cat.slug}.${i + 1}@qyzmettap.kz`;
      const firstName = FIRST_NAMES[(cIdx * 5 + i) % FIRST_NAMES.length];
      const lastName = LAST_NAMES[(cIdx * 3 + i) % LAST_NAMES.length];
      const fullName = `${firstName} ${lastName}`;
      const loc = AKTAU_LOCATIONS[(cIdx + i) % AKTAU_LOCATIONS.length];
      // Slight deterministic jitter so markers don't overlap on the map
      const lat = Number((loc.lat + (cIdx * 0.0012 - 0.003) + i * 0.0007).toFixed(6));
      const lng = Number((loc.lng + (cIdx * 0.0015 - 0.004) - i * 0.0006).toFixed(6));

      const user = await prisma.user.upsert({
        where: { email },
        update: {
          name: fullName,
          role: UserRole.PROVIDER,
        },
        create: {
          name: fullName,
          email,
          passwordHash,
          role: UserRole.PROVIDER,
        },
      });

      const profile = await prisma.providerProfile.upsert({
        where: { userId: user.id },
        update: {
          city: "Ақтау",
          publicLocation: loc.location,
          latitude: lat,
          longitude: lng,
          indicativePrice: new Prisma.Decimal(prices[i]),
          experience: EXPERIENCE_OPTIONS[i % EXPERIENCE_OPTIONS.length],
          description: `${cat.nameKk} бағыты бойынша Ақтау қаласында кәсіби қызмет көрсетемін. Жұмыс басталмас бұрын баға мен мерзімді нақты келісіп аламыз.`,
          isPremium: i === 0,
        },
        create: {
          userId: user.id,
          city: "Ақтау",
          publicLocation: loc.location,
          latitude: lat,
          longitude: lng,
          indicativePrice: new Prisma.Decimal(prices[i]),
          experience: EXPERIENCE_OPTIONS[i % EXPERIENCE_OPTIONS.length],
          description: `${cat.nameKk} бағыты бойынша Ақтау қаласында кәсіби қызмет көрсетемін. Жұмыс басталмас бұрын баға мен мерзімді нақты келісіп аламыз.`,
          isPremium: i === 0,
        },
      });

      await prisma.providerCategory.upsert({
        where: {
          providerId_categoryId: {
            providerId: profile.id,
            categoryId: cat.id,
          },
        },
        update: {},
        create: {
          providerId: profile.id,
          categoryId: cat.id,
        },
      });

      createdOrUpdated++;
    }
  }

  console.log(
    `Done! Seeded ${createdOrUpdated} providers across ${categories.length} categories (5 per category).`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

