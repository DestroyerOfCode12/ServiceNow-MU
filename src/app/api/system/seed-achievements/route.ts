import { NextResponse } from "next/server";
import { safeTokenEquals } from "@/lib/auth-token";
import { prisma } from "@/lib/prisma";
import { ACHIEVEMENTS } from "../../../../../prisma/seed-data/achievements";

/**
 * Narrow, always-safe-to-re-run sibling of /api/system/seed: upserts only
 * the achievement definitions (keyed by their unique `code`), leaving
 * everything else untouched. Exists because /api/system/seed refuses to
 * run a second time once a deployment is already seeded, but new
 * seed-only content (like the gamification achievement set, added after
 * the initial production seed) still needs a way to reach an already-live
 * database with no direct network access from outside the platform.
 */
export async function POST(req: Request) {
  const token = process.env.SEED_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "SEED_TOKEN is not configured on this deployment." }, { status: 501 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!safeTokenEquals(provided, token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let created = 0;
  let updated = 0;
  for (const a of ACHIEVEMENTS) {
    const existing = await prisma.achievement.findUnique({ where: { code: a.code } });
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: {
        name: a.name,
        description: a.description,
        icon: a.icon,
        criteriaType: a.criteriaType,
        criteriaThreshold: a.criteriaThreshold ?? null,
        xpReward: a.xpReward,
        sortOrder: a.sortOrder,
      },
      create: {
        code: a.code,
        name: a.name,
        description: a.description,
        icon: a.icon,
        criteriaType: a.criteriaType,
        criteriaThreshold: a.criteriaThreshold ?? null,
        xpReward: a.xpReward,
        sortOrder: a.sortOrder,
      },
    });
    if (existing) updated++;
    else created++;
  }

  return NextResponse.json({ ok: true, created, updated, total: ACHIEVEMENTS.length });
}
