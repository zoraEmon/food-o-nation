//Checking if Prisma is working properly

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.try.findMany();
  console.log("Rows:", rows);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect(); 
  });
