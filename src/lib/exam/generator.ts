import { AttemptMode, Difficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { selectQuestions } from "./question-selector";
import { distributeQuestions, rebalanceForAvailability, type WeightedDomain } from "./distribution";

export interface AttemptPlanItem {
  domainId?: string;
  topicId?: string;
  count: number;
  preferredDifficulty?: "EASY" | "MEDIUM" | "HARD";
}

export interface GenerateAttemptParams {
  userId: string;
  mode: AttemptMode;
  durationSeconds: number; // 0 = untimed
  plan: AttemptPlanItem[];
  examEligibleOnly: boolean;
  blueprintVersionId?: string;
  generationParams?: Record<string, unknown>;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Builds the per-domain plan for a full, blueprint-weighted exam of `totalQuestions`. */
export async function buildFullExamPlan(blueprintVersionId: string, totalQuestions: number): Promise<AttemptPlanItem[]> {
  const domains = await prisma.examDomain.findMany({ where: { blueprintVersionId } });
  const weighted: WeightedDomain[] = domains.map((d) => ({ id: d.id, weightPercent: d.weightPercent }));
  const target = distributeQuestions(weighted, totalQuestions);

  const availableCounts = await Promise.all(
    domains.map(async (d) => {
      const count = await prisma.question.count({ where: { domainId: d.id, examEligible: true } });
      return [d.id, count] as const;
    }),
  );
  const available = new Map(availableCounts);

  const achievable = rebalanceForAvailability(target, available, weighted);
  return achievable.filter((a) => a.slots > 0).map((a) => ({ domainId: a.id, count: a.slots }));
}

export async function generateAttempt(params: GenerateAttemptParams) {
  const pickedIds: string[] = [];
  const pickedQuestions: Awaited<ReturnType<typeof selectQuestions>> = [];

  for (const item of params.plan) {
    if (item.count <= 0) continue;
    const picked = await selectQuestions({
      userId: params.userId,
      domainId: item.domainId,
      topicId: item.topicId,
      count: item.count,
      examEligibleOnly: params.examEligibleOnly,
      excludeQuestionIds: pickedIds,
      preferredDifficulty: item.preferredDifficulty,
    });
    for (const q of picked) {
      pickedIds.push(q.id);
      pickedQuestions.push(q);
    }
  }

  const orderedQuestions = shuffle(pickedQuestions);
  const now = new Date();
  const deadline = params.durationSeconds > 0 ? new Date(now.getTime() + params.durationSeconds * 1000) : null;

  const attempt = await prisma.examAttempt.create({
    data: {
      userId: params.userId,
      mode: params.mode,
      blueprintVersionId: params.blueprintVersionId,
      durationSeconds: params.durationSeconds,
      startedAt: now,
      serverDeadlineAt: deadline,
      totalQuestions: orderedQuestions.length,
      generationParams: params.generationParams ? JSON.parse(JSON.stringify(params.generationParams)) : undefined,
      questions: {
        create: orderedQuestions.map((q, idx) => ({
          questionId: q.id,
          orderIndex: idx,
          optionOrder: shuffle(q.options.map((o) => o.id)),
          domainIdSnapshot: q.domainId,
          topicIdSnapshot: q.topicId,
          difficultySnapshot: q.difficulty as Difficulty,
          answer: { create: {} },
        })),
      },
    },
    include: { questions: true },
  });

  // Bump exposure ("seen") for every question presented in this attempt.
  await Promise.all(
    orderedQuestions.map((q) =>
      prisma.questionExposure.upsert({
        where: { userId_questionId: { userId: params.userId, questionId: q.id } },
        update: { timesSeen: { increment: 1 }, lastSeenAt: now },
        create: { userId: params.userId, questionId: q.id, timesSeen: 1, lastSeenAt: now },
      }),
    ),
  );

  return attempt;
}
