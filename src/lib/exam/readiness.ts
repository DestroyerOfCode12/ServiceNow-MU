import { AttemptStatus, AttemptMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * CSA Practice Readiness Score (spec section 36) — an internal, transparent
 * 0-100 composite. It never claims to predict the real ServiceNow exam with
 * certainty; it's a study-planning signal built from this platform's own
 * data. Weights are documented here, not hidden:
 *
 *   25% lifetime accuracy across all answered questions
 *   20% recent accuracy (last 50 answered questions) — catches recent improvement/regression
 *   15% domain coverage — fraction of the 6 CSA domains with meaningful practice volume
 *   15% weak-topic performance — penalizes topics still below a healthy accuracy bar
 *   15% full-exam performance — average score across completed Full CSA Exam attempts
 *   10% consistency — current study streak, capped
 */
export interface ReadinessResult {
  score: number;
  band: "Needs focused study" | "Building foundation" | "Developing readiness" | "Strong preparation" | "Exam ready";
  components: {
    lifetimeAccuracy: number;
    recentAccuracy: number;
    domainCoverage: number;
    weakTopicPerformance: number;
    fullExamPerformance: number;
    consistency: number;
  };
  recommendations: string[];
}

const WEIGHTS = {
  lifetimeAccuracy: 0.25,
  recentAccuracy: 0.2,
  domainCoverage: 0.15,
  weakTopicPerformance: 0.15,
  fullExamPerformance: 0.15,
  consistency: 0.1,
};

function bandFor(score: number): ReadinessResult["band"] {
  if (score >= 90) return "Exam ready";
  if (score >= 75) return "Strong preparation";
  if (score >= 60) return "Developing readiness";
  if (score >= 40) return "Building foundation";
  return "Needs focused study";
}

export async function computeReadiness(userId: string): Promise<ReadinessResult> {
  const exposures = await prisma.questionExposure.findMany({ where: { userId } });
  const totalAnswered = exposures.reduce((s, e) => s + e.timesCorrect + e.timesIncorrect, 0);
  const totalCorrect = exposures.reduce((s, e) => s + e.timesCorrect, 0);
  const lifetimeAccuracy = totalAnswered > 0 ? (totalCorrect / totalAnswered) * 100 : 0;

  const recentAnswers = await prisma.examAnswer.findMany({
    where: { examQuestion: { attempt: { userId } }, isCorrect: { not: null }, answeredAt: { not: null } },
    orderBy: { answeredAt: "desc" },
    take: 50,
  });
  const recentAccuracy =
    recentAnswers.length > 0 ? (recentAnswers.filter((a) => a.isCorrect).length / recentAnswers.length) * 100 : lifetimeAccuracy;

  const domainProgress = await prisma.userDomainProgress.findMany({ where: { userId } });
  const totalDomains = await prisma.examDomain.count();
  const coveredDomains = domainProgress.filter((d) => d.questionsAnswered >= 5).length;
  const domainCoverage = totalDomains > 0 ? (coveredDomains / totalDomains) * 100 : 0;

  const topicProgress = await prisma.userTopicProgress.findMany({
    where: { userId, questionsAnswered: { gte: 3 } },
    include: { topic: true },
  });
  const topicAccuracies = topicProgress.map((t) => ({
    name: t.topic.name,
    accuracy: t.questionsAnswered > 0 ? (t.correctAnswers / t.questionsAnswered) * 100 : 0,
  }));
  const weakTopics = topicAccuracies.filter((t) => t.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);
  const weakTopicPerformance =
    topicAccuracies.length === 0 ? 50 : Math.max(0, 100 - weakTopics.length * 12);

  const fullExams = await prisma.examAttempt.findMany({
    where: { userId, mode: AttemptMode.FULL_EXAM, status: AttemptStatus.SUBMITTED },
    orderBy: { submittedAt: "desc" },
  });
  const fullExamPerformance =
    fullExams.length > 0 ? fullExams.reduce((s, e) => s + (e.scorePercent ?? 0), 0) / fullExams.length : lifetimeAccuracy;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  const consistency = Math.min(100, ((profile?.studyStreakDays ?? 0) / 14) * 100);

  const components = { lifetimeAccuracy, recentAccuracy, domainCoverage, weakTopicPerformance, fullExamPerformance, consistency };

  const score = Math.round(
    components.lifetimeAccuracy * WEIGHTS.lifetimeAccuracy +
      components.recentAccuracy * WEIGHTS.recentAccuracy +
      components.domainCoverage * WEIGHTS.domainCoverage +
      components.weakTopicPerformance * WEIGHTS.weakTopicPerformance +
      components.fullExamPerformance * WEIGHTS.fullExamPerformance +
      components.consistency * WEIGHTS.consistency,
  );

  const recommendations: string[] = [];
  for (const t of weakTopics.slice(0, 3)) recommendations.push(`Review ${t.name}`);
  if (fullExams.length < 3) recommendations.push(`Complete ${3 - fullExams.length} more full exam${3 - fullExams.length === 1 ? "" : "s"}`);
  if (domainCoverage < 100) recommendations.push("Practice at least 5 questions in every CSA domain");
  if (recommendations.length === 0) recommendations.push("Keep up full-exam practice to maintain readiness");

  return { score: Math.max(0, Math.min(100, score)), band: bandFor(score), components, recommendations };
}
