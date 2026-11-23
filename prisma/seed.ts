import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_CATEGORIES = [
  {
    nameKk: "Электрик",
    slug: "elektrik",
    icon: "Zap",
    sortOrder: 1,
  },
  {
    nameKk: "Сантехник",
    slug: "santehnik",
    icon: "Wrench",
    sortOrder: 2,
  },
  {
    nameKk: "Үй тазалау",
    slug: "ui-tazalau",
    icon: "Sparkles",
    sortOrder: 3,
  },
  {
    nameKk: "Репетитор",
    slug: "repetitor",
    icon: "GraduationCap",
    sortOrder: 4,
  },
  {
    nameKk: "Техника жөндеу",
    slug: "tehnika-zhondeu",
    icon: "Settings",
    sortOrder: 5,
  },
  {
    nameKk: "Басқа қызметтер",
    slug: "basqa-qyzmetter",
    icon: "LayoutGrid",
    sortOrder: 6,
  },
];

async function main() {
  console.log("Seeding QyzmetTap service categories...");

  for (const cat of INITIAL_CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {
        nameKk: cat.nameKk,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
      create: {
        nameKk: cat.nameKk,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${INITIAL_CATEGORIES.length} service categories.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

