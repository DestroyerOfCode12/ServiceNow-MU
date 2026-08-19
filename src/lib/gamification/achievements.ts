import { AttemptMode, AttemptStatus, type PrismaClient } from "@prisma/client";

/**
 * Achievement *definitions* are entirely DB-driven (admin CRUD, section 3
 * of the gamification plan) — but the small set of ways a definition can be
 * satisfied is a fixed, code-defined vocabulary (AchievementCriteriaType),
 * same pattern as ValidationStatus elsewhere in this platform. Each check
 * below answers one question: "does this user currently satisfy this
 * criteria type, at this threshold?" — using data that already exists
 * elsewhere (Profile streak fields, UserDomainProgress, UserTopicProgress,
 * ExamAttempt), never a duplicate/parallel tracking table.
 */
async function currentStat(
  prisma: PrismaClient,
  userId: string,
  type: string,
): Promise<{ satisfied: (threshold: number | null) => boolean }> {
  switch (type) {
    case "STREAK_DAYS": {
      const profile = await prisma.profile.findUnique({ where: { userId } });
      const streak = profile?.studyStreakDays ?? 0;
      return { satisfied: (threshold) => streak >= (threshold ?? Infinity) };
    }
    case "QUESTIONS_ANSWERED": {
      const agg = await prisma.userDomainProgress.aggregate({
        where: { userId },
        _sum: { questionsAnswered: true },
      });
      const total = agg._sum.questionsAnswered ?? 0;
      return { satisfied: (threshold) => total >= (threshold ?? Infinity) };
    }
    case "EXAMS_COMPLETED": {
      const count = await prisma.examAttempt.count({
        where: { userId, status: AttemptStatus.SUBMITTED, mode: { in: [AttemptMode.FULL_EXAM, AttemptMode.TIMED_PRACTICE] } },
      });
      return { satisfied: (threshold) => count >= (threshold ?? Infinity) };
    }
    case "DOMAIN_PERFECT": {
      // Prisma can't compare two columns directly, so filter "100% accuracy" in JS.
      const rows = await prisma.userDomainProgress.findMany({ where: { userId, questionsAnswered: { gt: 0 } } });
      const anyPerfect = rows.some((r) => r.correctAnswers === r.questionsAnswered);
      return { satisfied: () => anyPerfect };
    }
    case "TOPIC_MASTERED_COUNT": {
      const rows = await prisma.userTopicProgress.findMany({ where: { userId, questionsAnswered: { gte: 3 } } });
      const masteredCount = rows.filter((r) => r.correctAnswers / r.questionsAnswered >= 0.8).length;
      return { satisfied: (threshold) => masteredCount >= (threshold ?? Infinity) };
    }
    case "FIRST_EXAM_COMPLETED": {
      const count = await prisma.examAttempt.count({
        where: { userId, status: AttemptStatus.SUBMITTED, mode: AttemptMode.FULL_EXAM },
      });
      return { satisfied: () => count >= 1 };
    }
    default:
      return { satisfied: () => false };
  }
}

export interface UnlockedAchievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  xpReward: number;
}

/**
 * Call after any event that could plausibly unlock something (attempt
 * submitted, streak updated) — see updateStudyStreak()/scoreAttempt() in
 * lib/exam/scoring.ts for the call sites. Cheap: only active achievements
 * the user hasn't already unlocked are evaluated, and each unlock is
 * recorded via the (userId, achievementId) unique constraint so a race
 * between two calls can't double-award it.
 */
export async function checkAndUnlockAchievements(prisma: PrismaClient, userId: string, attemptId?: string): Promise<UnlockedAchievement[]> {
  const [candidates, alreadyUnlocked] = await Promise.all([
    prisma.achievement.findMany({ where: { isActive: true } }),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
  ]);
  const unlockedIds = new Set(alreadyUnlocked.map((u) => u.achievementId));
  const toCheck = candidates.filter((a) => !unlockedIds.has(a.id));
  if (toCheck.length === 0) return [];

  const newlyUnlocked: UnlockedAchievement[] = [];
  for (const achievement of toCheck) {
    const { satisfied } = await currentStat(prisma, userId, achievement.criteriaType);
    if (!satisfied(achievement.criteriaThreshold)) continue;

    try {
      await prisma.$transaction([
        prisma.userAchievement.create({ data: { userId, achievementId: achievement.id, attemptId } }),
        ...(achievement.xpReward > 0
          ? [
              prisma.xPEvent.create({
                data: { userId, amount: achievement.xpReward, source: "ACHIEVEMENT_UNLOCKED" },
              }),
            ]
          : []),
      ]);
      newlyUnlocked.push({
        id: achievement.id,
        code: achievement.code,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      });
    } catch {
      // Unique constraint race (two concurrent calls unlocking the same
      // achievement) — the other call won, nothing to do here.
    }
  }
  return newlyUnlocked;
}
