import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/lib/seed/run-seed";

const prisma = new PrismaClient();

runSeed(prisma, process.env.ADMIN_SEED_EMAIL ?? "admin@example.com", process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!")
  .then((result) => {
    console.log(result.log.join("\n"));
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
