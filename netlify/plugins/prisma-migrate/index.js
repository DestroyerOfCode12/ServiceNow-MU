/**
 * Local Netlify Build Plugin: applies pending Prisma migrations before the
 * Next.js build runs.
 *
 * This exists as a plugin (declared in netlify.toml) rather than a custom
 * `[build] command` or `postinstall` script for two reasons learned the hard
 * way while wiring this project up:
 *
 *  - A custom `[build] command` silently skipped Netlify's zero-config
 *    Next.js Runtime (0 functions ever got deployed, every route 404'd).
 *  - `postinstall` runs during the "Install dependencies" stage, which is
 *    BEFORE Netlify DB (the Neon extension) injects its connection string —
 *    that injection happens in the `onPreBuild` lifecycle stage, so a
 *    postinstall script never sees it.
 *
 * `onPreBuild` runs after dependency installation and after extension env
 * injection, and before the framework's own build step — exactly where
 * migrations need to run, without touching how that build step is invoked.
 */

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

  const attempts = 6;
  for (let i = 1; i <= attempts; i++) {
    const url = (await tryGetConnectionString()) ?? tryFallbackEnvVar();
    if (url) return url;
    if (i < attempts) await new Promise((r) => setTimeout(r, 3000));
  }
  return undefined;
}

module.exports = {
  onPreBuild: async ({ utils }) => {
    const databaseUrl = await resolveDatabaseUrl();

    if (!databaseUrl) {
      return utils.build.failBuild(
        "No DATABASE_URL could be resolved (checked @netlify/database and known fallback env var names). " +
          "Confirm the Neon/Netlify DB extension is installed and enabled for this site.",
      );
    }

    process.env.DATABASE_URL = databaseUrl;

    try {
      utils.run.command("npx prisma migrate deploy");
    } catch (error) {
      return utils.build.failBuild("`prisma migrate deploy` failed.", { error });
    }
  },
};
