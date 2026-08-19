#!/usr/bin/env node
/**
 * Runs `prisma migrate deploy` against whatever database is available.
 *
 * Invoked from `postinstall` (not a custom Netlify `[build] command`) so
 * that Netlify's own zero-config Next.js detection and Runtime plugin are
 * never bypassed — declaring a custom build command or explicitly forcing
 * `@netlify/plugin-nextjs` both turned out to break the build in practice.
 * `npm install` (and therefore this script) runs before the build command
 * regardless, so migrations still land before `next build` starts.
 *
 * On Netlify, the connection string comes from Netlify DB (the Neon
 * extension) via `@netlify/database`, not a plain env var — resolved here
 * with a short retry since the extension's own env injection can lag
 * slightly behind `npm install` starting.
 *
 * Outside Netlify (e.g. a contributor's first `npm install`), this must
 * never break the install: if DATABASE_URL isn't set and we're not running
 * on Netlify, it skips instead of failing.
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
    if (process.env[key]) return process.env[key];
  }
  return undefined;
}

async function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const isNetlify = process.env.NETLIFY === "true";
  const attempts = isNetlify ? 6 : 1;

  for (let i = 1; i <= attempts; i++) {
    const url = (await tryGetConnectionString()) ?? tryFallbackEnvVar();
    if (url) return url;
    if (i < attempts) await new Promise((r) => setTimeout(r, 3000));
  }

  return undefined;
}

const url = await resolveDatabaseUrl();

if (!url) {
  if (process.env.NETLIFY === "true") {
    console.error("No DATABASE_URL could be resolved on Netlify (checked @netlify/database and known fallback env var names).");
    process.exit(1);
  }
  console.log("[migrate] No DATABASE_URL configured locally — skipping `prisma migrate deploy`. Set DATABASE_URL in .env and run `npm run db:migrate` when ready.");
  process.exit(0);
}

process.env.DATABASE_URL = url;
console.log("\n$ npx prisma migrate deploy");
execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
