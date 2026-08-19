import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { loadAttemptDetail, analyzeAttempt } from "@/lib/exam/attempt-analysis";
import { getLifetimeXp, levelFromXp } from "@/lib/gamification/xp";
import { DomainPerformanceChart } from "@/components/charts/domain-performance-chart";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { AnimatedScore } from "./animated-score";
import { ResultsRewards } from "./results-rewards";

const MODE_LABELS: Record<string, string> = {
  FULL_EXAM: "Full CSA Exam",
  TIMED_PRACTICE: "Timed Practice",
  QUICK_PRACTICE: "Quick Practice",
  TOPIC_PRACTICE: "Topic Practice",
  DOMAIN_PRACTICE: "Domain Practice",
  WEAK_AREA_PRACTICE: "Smart Practice",
  RANDOM_PRACTICE: "Random Practice",
};

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/attempt/${id}/results`);

  const attempt = await loadAttemptDetail(id);
  if (!attempt || attempt.userId !== user.id) notFound();
  if (attempt.status === "IN_PROGRESS") redirect(`/attempt/${id}`);

  const analysis = analyzeAttempt(attempt);
  const score = attempt.correctCount;
  const total = attempt.totalQuestions;
  const pct = attempt.scorePercent ?? 0;

  // Gamification: what did THIS attempt earn, and did it cross a level boundary?
  // xpEvents/unlockedAchievements are looked up by attemptId — a real, traceable
  // link recorded at scoring time — rather than inferred from timestamps.
  const [xpEvents, unlockedAchievements, lifetimeXp] = await Promise.all([
    prisma.xPEvent.findMany({ where: { attemptId: id }, select: { amount: true } }),
    prisma.userAchievement.findMany({ where: { attemptId: id }, include: { achievement: true } }),
    getLifetimeXp(prisma, user.id),
  ]);
  const xpEarned = xpEvents.reduce((sum, e) => sum + e.amount, 0);
  const levelAfter = levelFromXp(lifetimeXp);
  const levelBefore = levelFromXp(lifetimeXp - xpEarned);
  const leveledUp = levelAfter.level > levelBefore.level;

  return (
    <div className="container-page py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-accent">{MODE_LABELS[attempt.mode] ?? attempt.mode} · Practice Result</p>
      <h1 className="mt-1 text-3xl font-bold text-foreground">Results</h1>

      <div className="mt-4">
        <ResultsRewards
          xpEarned={xpEarned}
          leveledUp={leveledUp}
          newLevel={levelAfter.level}
          scorePercent={pct}
          unlockedAchievements={unlockedAchievements.map((u) => ({
            id: u.id,
            name: u.achievement.name,
            description: u.achievement.description,
            icon: u.achievement.icon,
            xpReward: u.achievement.xpReward,
          }))}
        />
      </div>

      <Card className="mt-4">
        <CardBody className="flex flex-col items-center gap-2 py-8 text-center">
          <AnimatedScore score={score} total={total} percent={pct} />
          <p className="mt-3 max-w-lg text-sm text-foreground-muted">
            This score is a practice indicator and does not represent the official ServiceNow CSA pass/fail
            determination. ServiceNow does not publish its CSA exam cut score, so no pass/fail label is shown here.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm text-foreground-muted">
            <span>{attempt.unansweredCount} unanswered</span>
            <span>·</span>
            <span>{attempt.incorrectCount} incorrect</span>
            {analysis.averageResponseTimeSeconds != null && (
              <>
                <span>·</span>
                <span>Avg. response time {Math.round(analysis.averageResponseTimeSeconds)}s</span>
              </>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Domain Performance</h2>
          </CardHeader>
          <CardBody>
            <DomainPerformanceChart
              data={analysis.domainBreakdown.map((d) => ({
                domainCode: d.domainCode,
                domainName: d.domainName,
                correct: d.correct,
                total: d.total,
                accuracy: d.accuracy,
              }))}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-foreground">Highlights</h2>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <HighlightRow label="Strongest area" value={analysis.strongestDomain?.domainName} accent="success" />
            <HighlightRow label="Weakest area" value={analysis.weakestDomain?.domainName} accent="warning" />
            <HighlightRow label="Most missed topic" value={analysis.mostMissedTopic?.topicName} accent="danger" />
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-foreground">Exam Review Intelligence</h2>
        </CardHeader>
        <CardBody className="grid gap-6 sm:grid-cols-3">
          <IntelligenceColumn title="What you know" icon="✓" variant="success" topics={analysis.known} />
          <IntelligenceColumn title="What you almost know" icon="⚠" variant="warning" topics={analysis.almostKnown} />
          <IntelligenceColumn title="What you should study next" icon="✕" variant="danger" topics={analysis.notKnown} />
        </CardBody>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <LinkButton href={`/attempt/${id}/review`}>Review Answers</LinkButton>
        <LinkButton href="/exams" variant="secondary">
          Back to Exams
        </LinkButton>
        <LinkButton href="/dashboard" variant="ghost">
          Dashboard
        </LinkButton>
      </div>
    </div>
  );
}

function HighlightRow({ label, value, accent }: { label: string; value?: string; accent: "success" | "warning" | "danger" }) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
      <span className="text-foreground-muted">{label}</span>
      {value ? <Badge variant={accent}>{value}</Badge> : <span className="text-foreground-muted">—</span>}
    </div>
  );
}

function IntelligenceColumn({
  title,
  icon,
  variant,
  topics,
}: {
  title: string;
  icon: string;
  variant: "success" | "warning" | "danger";
  topics: { topicId: string; topicName: string; accuracy: number }[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      {topics.length === 0 ? (
        <p className="text-sm text-foreground-muted">No topics in this range this attempt.</p>
      ) : (
        <ul className="space-y-1.5">
          {topics.map((t) => (
            <li key={t.topicId} className="flex items-center gap-2 text-sm">
              <Badge variant={variant}>{icon}</Badge>
              <span className="text-foreground">{t.topicName}</span>
              <span className="ml-auto text-xs text-foreground-muted">{t.accuracy.toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
