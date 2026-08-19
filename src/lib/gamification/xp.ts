import type { PrismaClient, XPSource } from "@prisma/client";

/**
 * Level is a pure function of lifetime XP — never a stored column (see the
 * schema comment above the Gamification section). Recomputing it here is
 * cheap and guarantees it can never drift out of sync with the XPEvent
 * ledger it represents.
 *
 * Cumulative XP required to REACH level L: 50 * (L - 1) * L — a simple
 * triangular growth curve (level 2 = 100 XP, level 3 = 300, level 4 = 600,
 * level 5 = 1000, ...). Implemented as a loop rather than the closed-form
 * inverse so correctness is obvious by inspection rather than by algebra.
 */
export function xpForLevel(level: number): number {
  return 50 * (level - 1) * level;
}

export interface LevelInfo {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;

  const currentFloor = xpForLevel(level);
  const nextFloor = xpForLevel(level + 1);
  const xpIntoLevel = xp - currentFloor;
  const xpForNextLevel = nextFloor - currentFloor;

  return {
    level,
    xp,
    xpIntoLevel,
    xpForNextLevel,
    progressPercent: xpForNextLevel > 0 ? Math.min(100, (xpIntoLevel / xpForNextLevel) * 100) : 100,
  };
}

/** XP awarded per event source — the single place these numbers live. */
export const XP_AWARDS = {
  CORRECT_ANSWER: 10,
  EXAM_COMPLETED: 50,
  STREAK_DAY: 25,
  TOPIC_MASTERED: 40,
  ACHIEVEMENT_UNLOCKED: 0, // achievements carry their own xpReward instead
} as const;

/** Writes one entry to the append-only XP ledger. A no-op for amount <= 0. */
export async function awardXp(prisma: PrismaClient, userId: string, amount: number, source: XPSource, attemptId?: string): Promise<void> {
  if (amount <= 0) return;
  await prisma.xPEvent.create({ data: { userId, amount, source, attemptId } });
}

export async function getLifetimeXp(prisma: PrismaClient, userId: string): Promise<number> {
  const agg = await prisma.xPEvent.aggregate({ where: { userId }, _sum: { amount: true } });
  return agg._sum.amount ?? 0;
}
