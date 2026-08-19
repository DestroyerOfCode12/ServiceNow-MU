import { prisma } from "@/lib/prisma";
import type { AttemptPlanItem } from "./generator";

const MIN_SAMPLE_SIZE = 3;

export interface TopicAccuracy {
  topicId: string;
  topicName: string;
  domainName: string;
  domainId: string;
  accuracy: number;
  questionsAnswered: number;
}

export async function getTopicAccuracies(userId: string): Promise<TopicAccuracy[]> {
  const rows = await prisma.userTopicProgress.findMany({
    where: { userId, questionsAnswered: { gte: MIN_SAMPLE_SIZE } },
    include: { topic: { include: { domain: true } } },
  });
  return rows
    .map((r) => ({
      topicId: r.topicId,
      topicName: r.topic.name,
      domainName: r.topic.domain.name,
      domainId: r.topic.domainId,
      accuracy: r.questionsAnswered > 0 ? (r.correctAnswers / r.questionsAnswered) * 100 : 0,
      questionsAnswered: r.questionsAnswered,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}

export interface DomainAccuracy {
  domainId: string;
  domainCode: string;
  domainName: string;
  accuracy: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export async function getDomainAccuracies(userId: string): Promise<DomainAccuracy[]> {
  const rows = await prisma.userDomainProgress.findMany({
    where: { userId },
    include: { domain: true },
  });
  return rows
    .map((r) => ({
      domainId: r.domainId,
      domainCode: r.domain.code,
      domainName: r.domain.name,
      accuracy: r.questionsAnswered > 0 ? (r.correctAnswers / r.questionsAnswered) * 100 : 0,
      questionsAnswered: r.questionsAnswered,
      correctAnswers: r.correctAnswers,
    }))
    .sort((a, b) => a.domainCode.localeCompare(b.domainCode));
}

/**
 * Adaptive practice plan (spec section 22): weight question counts toward
 * the user's weakest topics, filling the remainder with a mixed/random slice
 * so practice doesn't become monotonous.
 */
export async function buildAdaptivePracticePlan(userId: string, totalCount = 30): Promise<{ plan: AttemptPlanItem[]; weakTopics: TopicAccuracy[] }> {
  const weakTopics = (await getTopicAccuracies(userId)).filter((t) => t.accuracy < 75).slice(0, 4);

  if (weakTopics.length === 0) {
    return { plan: [{ count: totalCount }], weakTopics: [] };
  }

  const weakSlots = Math.round(totalCount * 0.7);
  const mixedSlots = totalCount - weakSlots;

  // Weight weak topics inversely to their accuracy — weaker gets more questions.
  const inverseWeights = weakTopics.map((t) => 100 - t.accuracy);
  const totalWeight = inverseWeights.reduce((a, b) => a + b, 0) || 1;

  const plan: AttemptPlanItem[] = weakTopics.map((t, i) => ({
    topicId: t.topicId,
    count: Math.max(1, Math.round((inverseWeights[i] / totalWeight) * weakSlots)),
  }));

  if (mixedSlots > 0) plan.push({ count: mixedSlots });

  return { plan, weakTopics };
}
