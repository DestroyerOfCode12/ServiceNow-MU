import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * On Netlify, the database is Netlify DB (Neon) and its connection string is
 * resolved dynamically via `@netlify/database` rather than a static env var
 * an admin configured by hand. Everywhere else (local dev, other hosts),
 * DATABASE_URL from `.env` is used as-is and this is a no-op.
 */
function resolveDatabaseUrl(): void {
  if (process.env.DATABASE_URL) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getConnectionString } = require("@netlify/database") as typeof import("@netlify/database");
    const url = getConnectionString();
    if (url) process.env.DATABASE_URL = url;
  } catch {
    // Not running on Netlify (or the package isn't available) — nothing to do.
  }
}

resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
