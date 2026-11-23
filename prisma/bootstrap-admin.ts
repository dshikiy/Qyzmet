import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "QyzmetTap Әкімшісі";

  if (!email || !password) {
    console.error(
      "ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required."
    );
    process.exit(1);
  }

  if (password.length < 10) {
    console.error("ADMIN_PASSWORD must be at least 10 characters long.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      name,
      email,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin account ready: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error("Admin bootstrap error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

