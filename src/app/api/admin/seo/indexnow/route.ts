import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site";
import { submitUrlsToIndexNow } from "@/lib/indexnow";

// Same route list as sitemap.ts — the set of URLs actually allowed by
// robots.txt — kept in sync by hand since sitemap.ts's generator function
// isn't exported for reuse.
export async function POST() {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const topics = await prisma.topic.findMany({ select: { slug: true } });

  const urls = [
    `${SITE_URL}/`,
    `${SITE_URL}/login`,
    `${SITE_URL}/register`,
    `${SITE_URL}/study`,
    `${SITE_URL}/study/cheat-sheets`,
    `${SITE_URL}/study/flashcards`,
    `${SITE_URL}/privacy`,
    `${SITE_URL}/terms`,
    ...topics.map((t) => `${SITE_URL}/study/topics/${t.slug}`),
  ];

  try {
    const result = await submitUrlsToIndexNow(urls);
    if (!result.ok) {
      return NextResponse.json({ error: `IndexNow responded with ${result.status}: ${result.body}` }, { status: 502 });
    }
    return NextResponse.json({ submitted: urls.length });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "IndexNow submission failed." }, { status: 500 });
  }
}
