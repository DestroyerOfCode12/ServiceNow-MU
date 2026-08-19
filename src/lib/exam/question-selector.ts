import { Prisma, ValidationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Question-selection algorithm (spec section 10). Priority order:
 *   1. Current verified questions (over needs_review/draft)
 *   2. Questions matching the blueprint (domain/topic filters applied by the caller)
 *   3. Questions the user hasn't recently seen (exposure tracking)
 *   4. Appropriate difficulty (soft preference, doesn't exclude)
 *   5. Topic diversity within the domain (avoid clustering on one concept)
 */
export interface SelectQuestionsParams {
  userId: string;
  domainId?: string;
  topicId?: string;
  count: number;
  examEligibleOnly: boolean;
  excludeQuestionIds?: string[];
  preferredDifficulty?: "EASY" | "MEDIUM" | "HARD";
}

const STATUS_RANK: Record<ValidationStatus, number> = {
  VERIFIED: 0,
  NEEDS_REVIEW: 1,
  DRAFT: 2,
  OUTDATED: 3,
  REJECTED: 4,
};

const DIFFICULTY_RANK = { EASY: 0, MEDIUM: 1, HARD: 2 } as const;

export async function selectQuestions(params: SelectQuestionsParams) {
  const where: Prisma.QuestionWhereInput = {
    validationStatus: { notIn: [ValidationStatus.REJECTED, ValidationStatus.OUTDATED] },
    id: params.excludeQuestionIds?.length ? { notIn: params.excludeQuestionIds } : undefined,
  };
  if (params.domainId) where.domainId = params.domainId;
  if (params.topicId) where.topicId = params.topicId;
  if (params.examEligibleOnly) where.examEligible = true;

  const candidates = await prisma.question.findMany({
    where,
    include: {
      options: true,
      exposures: { where: { userId: params.userId } },
    },
  });

  if (candidates.length === 0) return [];

  const scored = candidates.map((q) => {
    const exposure = q.exposures[0];
    const timesSeen = exposure?.timesSeen ?? 0;
    const lastSeenAt = exposure?.lastSeenAt?.getTime() ?? 0; // 0 = never seen, sorts first
    const difficultyDelta = params.preferredDifficulty
      ? Math.abs(DIFFICULTY_RANK[q.difficulty] - DIFFICULTY_RANK[params.preferredDifficulty])
      : 0;

    return { question: q, timesSeen, lastSeenAt, difficultyDelta, jitter: Math.random() };
  });

  scored.sort((a, b) => {
    const statusDiff = STATUS_RANK[a.question.validationStatus] - STATUS_RANK[b.question.validationStatus];
    if (statusDiff !== 0) return statusDiff;
    if (a.timesSeen !== b.timesSeen) return a.timesSeen - b.timesSeen;
    if (a.lastSeenAt !== b.lastSeenAt) return a.lastSeenAt - b.lastSeenAt;
    if (a.difficultyDelta !== b.difficultyDelta) return a.difficultyDelta - b.difficultyDelta;
    return a.jitter - b.jitter;
  });

  // Topic diversity pass: walk the sorted list round-robin by topic so we don't
  // cluster every pick on one topic before touching the others.
  const byTopic = new Map<string, typeof scored>();
  for (const item of scored) {
    const key = item.question.topicId ?? "none";
    if (!byTopic.has(key)) byTopic.set(key, []);
    byTopic.get(key)!.push(item);
  }

  const picked: typeof scored = [];
  let stillHasItems = true;
  while (picked.length < params.count && stillHasItems) {
    stillHasItems = false;
    for (const bucket of byTopic.values()) {
      if (picked.length >= params.count) break;
      const next = bucket.shift();
      if (next) {
        picked.push(next);
        stillHasItems = true;
      }
    }
  }

  return picked.map((p) => p.question);
}
