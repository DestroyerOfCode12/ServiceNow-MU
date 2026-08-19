#!/usr/bin/env node
/**
 * Netlify build entrypoint.
 *
 * Netlify DB (the Neon extension) provisions a Postgres database and injects
 * its connection string into the build environment when it detects the
 * `@netlify/database` dependency — but under a Netlify-specific env var, not
 * a plain `DATABASE_URL` Prisma can read directly. This resolves that first,
 * then applies pending Prisma migrations against it, then runs the normal
 * Next.js build.
 */
import { execSync } from "node:child_process";

async function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  const { getConnectionString } = await import("@netlify/database");
  const url = getConnectionString();
  if (!url) {
    throw new Error(
      "No DATABASE_URL was set and @netlify/database could not resolve a connection string. " +
        "Confirm the Neon/Netlify DB extension is installed and enabled for this site.",
    );
  }
  process.env.DATABASE_URL = url;
}

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, { stdio: "inherit", env: process.env });
}

await resolveDatabaseUrl();
run("npx prisma migrate deploy");
run("npx next build");
