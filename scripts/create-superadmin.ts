import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      nameAr: "المدير العام",
      username: "superadmin",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  console.log("Created:", user);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
