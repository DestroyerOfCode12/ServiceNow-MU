#!/usr/bin/env node
/**
 * Netlify build entrypoint.
 *
 * Netlify DB (the Neon extension) provisions a Postgres database and injects
 * its connection string into the build environment when it detects the
 * `@netlify/database` dependency — but under a Netlify-specific env var, not
 * a plain `DATABASE_URL` Prisma can read directly. This resolves that first
 * (retrying briefly in case the extension's own build step hasn't finished
 * injecting env vars yet), then applies pending Prisma migrations against
 * it, then runs the normal Next.js build.
 */
import { execSync } from "node:child_process";

const FALLBACK_ENV_KEYS = [
  "NETLIFY_DATABASE_URL",
  "NETLIFY_DATABASE_URL_UNPOOLED",
  "NETLIFY_DB_URL",
  "DATABASE_URL_UNPOOLED",
  "NEON_DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
];

async function tryGetConnectionString() {
  try {
    const { getConnectionString } = await import("@netlify/database");
    return getConnectionString();
  } catch {
    return undefined;
  }
}

function tryFallbackEnvVar() {
  for (const key of FALLBACK_ENV_KEYS) {
    if (process.env[key]) {
      console.log(`Using ${key} as the database connection string.`);
      return process.env[key];
    }
  }
  return undefined;
}

async function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return;

  const attempts = 6;
  for (let i = 1; i <= attempts; i++) {
    const url = (await tryGetConnectionString()) ?? tryFallbackEnvVar();
    if (url) {
      process.env.DATABASE_URL = url;
      return;
    }
    console.log(`Database connection string not yet available (attempt ${i}/${attempts}) — retrying…`);
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.error(
    "Diagnostic: no DATABASE_URL-like env var was found. Keys present:",
    Object.keys(process.env).sort().join(", "),
  );
  throw new Error(
    "No DATABASE_URL was set and no Netlify DB connection string could be resolved after retrying. " +
      "Confirm the Neon/Netlify DB extension is installed and enabled for this site.",
  );
}

function run(command) {
  console.log(`\n$ ${command}`);
  execSync(command, { stdio: "inherit", env: process.env });
}

await resolveDatabaseUrl();
run("npx prisma migrate deploy");
run("npx next build");
