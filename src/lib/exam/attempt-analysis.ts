import { prisma } from "@/lib/prisma";

export type AttemptWithDetail = NonNullable<Awaited<ReturnType<typeof loadAttemptDetail>>>;

export async function loadAttemptDetail(attemptId: string) {
  return prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: {
          question: { include: { options: true, topic: true, domain: true } },
          answer: true,
        },
      },
    },
  });
}

export interface DomainBreakdown {
  domainId: string;
  domainName: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface TopicBreakdown {
  topicId: string;
  topicName: string;
  correct: number;
  total: number;
  accuracy: number;
}

export interface AttemptAnalysis {
  domainBreakdown: DomainBreakdown[];
  topicBreakdown: TopicBreakdown[];
  strongestDomain: DomainBreakdown | null;
  weakestDomain: DomainBreakdown | null;
  mostMissedTopic: TopicBreakdown | null;
  averageResponseTimeSeconds: number | null;
  known: TopicBreakdown[]; // >= 80%
  almostKnown: TopicBreakdown[]; // 50-79%
  notKnown: TopicBreakdown[]; // < 50%
}

export function analyzeAttempt(attempt: AttemptWithDetail): AttemptAnalysis {
  const domainMap = new Map<string, DomainBreakdown>();
  const topicMap = new Map<string, TopicBreakdown>();
  const responseTimes: number[] = [];

  for (const eq of attempt.questions) {
    const selected: string[] = Array.isArray(eq.answer?.selectedOptionIds) ? (eq.answer!.selectedOptionIds as string[]) : [];
    const isCorrect = eq.answer?.isCorrect ?? false;
    if (eq.answer?.responseTimeSeconds != null) responseTimes.push(eq.answer.responseTimeSeconds);

    const dKey = eq.question.domainId;
    const d = domainMap.get(dKey) ?? { domainId: dKey, domainName: eq.question.domain.name, correct: 0, total: 0, accuracy: 0 };
    d.total += 1;
    if (isCorrect) d.correct += 1;
    domainMap.set(dKey, d);

    if (eq.question.topicId) {
      const tKey = eq.question.topicId;
      const t = topicMap.get(tKey) ?? { topicId: tKey, topicName: eq.question.topic?.name ?? "Untitled topic", correct: 0, total: 0, accuracy: 0 };
      t.total += 1;
      if (isCorrect) t.correct += 1;
      topicMap.set(tKey, t);
    }
    void selected;
  }

  const domainBreakdown = [...domainMap.values()].map((d) => ({ ...d, accuracy: d.total > 0 ? (d.correct / d.total) * 100 : 0 }));
  const topicBreakdown = [...topicMap.values()].map((t) => ({ ...t, accuracy: t.total > 0 ? (t.correct / t.total) * 100 : 0 }));

  const sortedDomains = [...domainBreakdown].sort((a, b) => b.accuracy - a.accuracy);
  const sortedTopicsAsc = [...topicBreakdown].sort((a, b) => a.accuracy - b.accuracy);

  return {
    domainBreakdown: domainBreakdown.sort((a, b) => a.domainName.localeCompare(b.domainName)),
    topicBreakdown,
    strongestDomain: sortedDomains[0] ?? null,
    weakestDomain: sortedDomains[sortedDomains.length - 1] ?? null,
    mostMissedTopic: sortedTopicsAsc[0] ?? null,
    averageResponseTimeSeconds: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : null,
    known: topicBreakdown.filter((t) => t.accuracy >= 80),
    almostKnown: topicBreakdown.filter((t) => t.accuracy >= 50 && t.accuracy < 80),
    notKnown: topicBreakdown.filter((t) => t.accuracy < 50),
  };
}
