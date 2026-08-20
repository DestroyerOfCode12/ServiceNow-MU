import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";

// Forces this to render per-request instead of being prerendered once at
// build time. Two reasons: (1) the topic list comes from the database, so a
// build-time-only render would go stale the moment a topic is added or
// renamed without a full redeploy, and (2) a build-time render makes the
// build itself depend on database reachability during the build step, which
// isn't guaranteed in every environment this gets built in.
export const dynamic = "force-dynamic";

// Only the routes robots.ts actually allows: the marketing/auth entry
// points, the public study section (browsable with no login), and the
// legal pages. Everything behind the login wall is deliberately excluded —
// see robots.ts for why.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const topics = await prisma.topic.findMany({ select: { slug: true }, orderBy: { sortOrder: "asc" } });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/register`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/study`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/study/cheat-sheets`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/study/flashcards`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const topicRoutes: MetadataRoute.Sitemap = topics.map((t) => ({
    url: `${SITE_URL}/study/topics/${t.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...topicRoutes];
}
