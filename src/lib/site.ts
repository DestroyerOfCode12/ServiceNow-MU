/**
 * Canonical production origin, used anywhere an absolute URL is required
 * (metadataBase, robots.txt, sitemap.xml, JSON-LD, Open Graph). Falls back to
 * the known Netlify domain so metadata generation never breaks in an
 * environment that hasn't set the env var — but a custom domain (or a
 * renamed Netlify site) should set NEXT_PUBLIC_SITE_URL so this stays
 * accurate without a code change.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://servicenow-csa-prep.netlify.app").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "CSA Prep Platform";
