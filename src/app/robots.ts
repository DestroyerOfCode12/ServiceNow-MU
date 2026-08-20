import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Every route below /dashboard, /practice, /exams, /progress, /bookmarks,
// /notes, /admin, /search, and /attempt is either login-walled by
// proxy.ts's middleware or (for /attempt) scoped to a single user's private
// exam-attempt data — none of it is content a search engine should crawl or
// index. /study/* and the legal pages are the genuinely public, indexable
// surface of the site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/dashboard", "/practice", "/exams", "/progress", "/bookmarks", "/notes", "/attempt", "/search"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
