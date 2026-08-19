import { describe, it, expect, beforeAll, afterAll } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateAttempt, buildFullExamPlan } from "./generator";
import { scoreAttempt } from "./scoring";
import { getDomainAccuracies, getTopicAccuracies } from "./weakness";
import { computeReadiness } from "./readiness";

/**
 * Integration coverage against a real database (the same one `prisma/seed.ts`
 * populates). Skipped automatically if no DATABASE_URL is configured, so
 * `npm test` still passes in an environment with no database attached — but
 * exercises the full generate -> answer -> score -> progress pipeline
 * end-to-end whenever one is available, which is how this suite is intended
 * to run (see README).
 */
const hasDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasDb)("exam generation + scoring integration", () => {
  let userId: string;

  beforeAll(async () => {
    const email = `vitest-${Date.now()}@example.test`;
    const user = await prisma.user.create({
      data: { email, passwordHash: await bcrypt.hash("Test1234!", 4), profile: { create: {} } },
    });
    userId = user.id;
  });

  afterAll(async () => {
    if (!userId) return;
    // Cascade delete covers attempts/exposures/progress rows tied to this user.
    await prisma.user.delete({ where: { id: userId } }).catch(() => null);
    await prisma.$disconnect();
  });

  it("builds a full exam plan that sums to the blueprint's question count", async () => {
    const blueprint = await prisma.blueprintVersion.findFirst({ where: { status: "ACTIVE" } });
    expect(blueprint).toBeTruthy();
    const plan = await buildFullExamPlan(blueprint!.id, blueprint!.questionCount);
    const total = plan.reduce((s, p) => s + p.count, 0);
    // May be slightly under the target if the seed content pool can't fully cover it,
    // but must never exceed it and must be > 0 given the seeded content.
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(blueprint!.questionCount);
  });

  it("generates a locked attempt with no duplicate questions and randomized option order", async () => {
    const attempt = await generateAttempt({ userId, mode: "QUICK_PRACTICE", durationSeconds: 0, plan: [{ count: 10 }], examEligibleOnly: false });
    expect(attempt.totalQuestions).toBeGreaterThan(0);

    const questionIds = attempt.questions.map((q) => q.questionId);
    expect(new Set(questionIds).size).toBe(questionIds.length); // no duplicates within one attempt

    for (const eq of attempt.questions) {
      expect(Array.isArray(eq.optionOrder)).toBe(true);
      expect((eq.optionOrder as string[]).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("scores an attempt correctly end-to-end and updates progress tables", async () => {
    const attempt = await generateAttempt({ userId, mode: "QUICK_PRACTICE", durationSeconds: 0, plan: [{ count: 5 }], examEligibleOnly: false });

    const full = await prisma.examAttempt.findUniqueOrThrow({
      where: { id: attempt.id },
      include: { questions: { include: { question: { include: { options: true } } } } },
    });

    // Answer every question correctly.
    for (const eq of full.questions) {
      const correct = eq.question.options.filter((o) => o.isCorrect).map((o) => o.id);
      await prisma.examAnswer.update({
        where: { examQuestionId: eq.id },
        data: { selectedOptionIds: correct, answeredAt: new Date() },
      });
    }

    const scored = await scoreAttempt(attempt.id, userId);
    expect(scored.status).toBe("SUBMITTED");
    expect(scored.correctCount).toBe(scored.totalQuestions);
    expect(scored.scorePercent).toBe(100);

    // Calling scoreAttempt again must be idempotent (e.g. a duplicate submit click).
    const scoredAgain = await scoreAttempt(attempt.id, userId);
    expect(scoredAgain.correctCount).toBe(scored.correctCount);

    const domainAccuracies = await getDomainAccuracies(userId);
    expect(domainAccuracies.some((d) => d.questionsAnswered > 0)).toBe(true);

    const readiness = await computeReadiness(userId);
    expect(readiness.score).toBeGreaterThanOrEqual(0);
    expect(readiness.score).toBeLessThanOrEqual(100);
  });

  it("marks a wrong multiple-select answer as fully incorrect (no partial credit) end-to-end", async () => {
    const multiSelectQuestion = await prisma.question.findFirst({
      where: { questionType: "MULTIPLE_SELECT", examEligible: true },
      include: { options: true },
    });
    if (!multiSelectQuestion) return; // seed content may vary; skip if none available

    const attempt = await generateAttempt({
      userId,
      mode: "TOPIC_PRACTICE",
      durationSeconds: 0,
      plan: [{ topicId: multiSelectQuestion.topicId ?? undefined, count: 1 }],
      examEligibleOnly: false,
    });
    const eq = await prisma.examQuestion.findFirst({ where: { attemptId: attempt.id }, include: { question: { include: { options: true } } } });
    if (!eq) return;

    const correctIds = eq.question.options.filter((o) => o.isCorrect).map((o) => o.id);
    const partialSelection = correctIds.slice(0, Math.max(1, correctIds.length - 1)); // miss one on purpose

    await prisma.examAnswer.update({
      where: { examQuestionId: eq.id },
      data: { selectedOptionIds: partialSelection, answeredAt: new Date() },
    });

    const scored = await scoreAttempt(attempt.id, userId);
    if (eq.question.questionType === "MULTIPLE_SELECT" && correctIds.length > 1) {
      expect(scored.correctCount).toBe(0);
    }
  });

  it("computes topic accuracy from real answered questions", async () => {
    const accuracies = await getTopicAccuracies(userId);
    for (const t of accuracies) {
      expect(t.accuracy).toBeGreaterThanOrEqual(0);
      expect(t.accuracy).toBeLessThanOrEqual(100);
    }
  });
});
