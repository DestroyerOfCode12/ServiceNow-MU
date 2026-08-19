import { AttemptStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Scores every answered question in an attempt. No partial credit:
 *  - single_choice: correct iff exactly the one correct option was selected.
 *  - multiple_select: correct iff the selected set is exactly equal to the
 *    correct set (missing or extra selections both count as incorrect).
 * Then rolls results into per-user question exposure, topic progress, and
 * domain progress, and marks the attempt SUBMITTED.
 */
export async function scoreAttempt(attemptId: string, userId: string) {
  const attempt = await prisma.examAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      questions: {
        include: {
          question: { include: { options: true } },
          answer: true,
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (attempt.userId !== userId) throw new Error("Not your attempt.");
  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    return attempt; // already scored — idempotent
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const topicDelta = new Map<string, { correct: number; total: number }>();
  const domainDelta = new Map<string, { correct: number; total: number }>();
  const now = new Date();

  for (const eq of attempt.questions) {
    const selected: string[] = Array.isArray(eq.answer?.selectedOptionIds) ? (eq.answer!.selectedOptionIds as string[]) : [];
    const correctOptionIds = eq.question.options.filter((o) => o.isCorrect).map((o) => o.id).sort();
    const selectedSorted = [...selected].sort();

    const answered = selected.length > 0;
    const isCorrect = answered && arraysEqual(selectedSorted, correctOptionIds);

    if (!answered) unansweredCount++;
    else if (isCorrect) correctCount++;
    else incorrectCount++;

    if (eq.answer) {
      await prisma.examAnswer.update({
        where: { id: eq.answer.id },
        data: { isCorrect: answered ? isCorrect : null },
      });
    }

    await prisma.questionExposure.upsert({
      where: { userId_questionId: { userId, questionId: eq.questionId } },
      update: {
        timesCorrect: { increment: answered && isCorrect ? 1 : 0 },
        timesIncorrect: { increment: answered && !isCorrect ? 1 : 0 },
        lastCorrectAt: answered && isCorrect ? now : undefined,
      },
      create: {
        userId,
        questionId: eq.questionId,
        timesSeen: 1,
        timesCorrect: answered && isCorrect ? 1 : 0,
        timesIncorrect: answered && !isCorrect ? 1 : 0,
        lastSeenAt: now,
        lastCorrectAt: answered && isCorrect ? now : null,
      },
    });

    const topicKey = eq.topicIdSnapshot ?? undefined;
    if (topicKey) {
      const t = topicDelta.get(topicKey) ?? { correct: 0, total: 0 };
      t.total += answered ? 1 : 0;
      t.correct += answered && isCorrect ? 1 : 0;
      topicDelta.set(topicKey, t);
    }
    const domainKey = eq.domainIdSnapshot;
    const d = domainDelta.get(domainKey) ?? { correct: 0, total: 0 };
    d.total += answered ? 1 : 0;
    d.correct += answered && isCorrect ? 1 : 0;
    domainDelta.set(domainKey, d);
  }

  for (const [topicId, delta] of topicDelta) {
    await prisma.userTopicProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: {
        questionsAnswered: { increment: delta.total },
        correctAnswers: { increment: delta.correct },
        lastPracticedAt: now,
      },
      create: { userId, topicId, questionsAnswered: delta.total, correctAnswers: delta.correct, lastPracticedAt: now },
    });
  }

  for (const [domainId, delta] of domainDelta) {
    await prisma.userDomainProgress.upsert({
      where: { userId_domainId: { userId, domainId } },
      update: {
        questionsAnswered: { increment: delta.total },
        correctAnswers: { increment: delta.correct },
        lastPracticedAt: now,
      },
      create: { userId, domainId, questionsAnswered: delta.total, correctAnswers: delta.correct, lastPracticedAt: now },
    });
  }

  const scorePercent = attempt.totalQuestions > 0 ? (correctCount / attempt.totalQuestions) * 100 : 0;

  const updated = await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      status: AttemptStatus.SUBMITTED,
      submittedAt: now,
      correctCount,
      incorrectCount,
      unansweredCount,
      scorePercent,
    },
  });

  await updateStudyStreak(userId);

  return updated;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

/** Updates the user's daily study streak (spec section 37). */
export async function updateStudyStreak(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return;

  const today = startOfDay(new Date());
  const last = profile.lastStudyDate ? startOfDay(profile.lastStudyDate) : null;

  if (last && last.getTime() === today.getTime()) return; // already counted today

  const oneDayMs = 24 * 60 * 60 * 1000;
  const isConsecutive = last && today.getTime() - last.getTime() === oneDayMs;
  const newStreak = isConsecutive ? profile.studyStreakDays + 1 : 1;

  await prisma.profile.update({
    where: { userId },
    data: {
      studyStreakDays: newStreak,
      longestStreakDays: Math.max(newStreak, profile.longestStreakDays),
      lastStudyDate: today,
    },
  });
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
