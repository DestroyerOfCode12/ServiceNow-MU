import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { DocumentationValidator } from "@/lib/validation/documentation-validator";
import { SubTabs } from "@/components/nav/sub-tabs";
import { ADMIN_TABS } from "@/components/nav/nav-links";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin/analytics");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [userCount, attemptCount, submittedAttempts, exposures, topics] = await Promise.all([
    prisma.user.count(),
    prisma.examAttempt.count(),
    prisma.examAttempt.findMany({ where: { status: "SUBMITTED" }, select: { scorePercent: true } }),
    prisma.questionExposure.findMany({ include: { question: true } }),
    prisma.topic.findMany(),
  ]);

  const avgScore = submittedAttempts.length > 0 ? submittedAttempts.reduce((s, a) => s + (a.scorePercent ?? 0), 0) / submittedAttempts.length : null;

  const byQuestion = new Map<string, { text: string; correct: number; total: number }>();
  for (const e of exposures) {
    const total = e.timesCorrect + e.timesIncorrect;
    if (total < 3) continue; // need a meaningful sample
    const row = byQuestion.get(e.questionId) ?? { text: e.question.questionText, correct: 0, total: 0 };
    row.correct += e.timesCorrect;
    row.total += total;
    byQuestion.set(e.questionId, row);
  }
  const mostDifficult = [...byQuestion.values()]
    .map((q) => ({ ...q, accuracy: (q.correct / q.total) * 100 }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 10);

  const staleTopics = topics.filter((t) => DocumentationValidator.isStale(t.lastValidatedAt));

  const qualityBuckets = await prisma.question.groupBy({
    by: ["examEligible", "examPreferred"],
    _count: true,
  });

  return (
    <div>
      <SubTabs tabs={ADMIN_TABS} />
      <div className="container-page py-10">
        <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Stat label="Users" value={userCount} />
          <Stat label="Attempts started" value={attemptCount} />
          <Stat label="Avg. submitted score" value={avgScore != null ? `${avgScore.toFixed(1)}%` : "—"} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-foreground">Most Difficult Questions</h2>
              <p className="text-xs text-foreground-muted">Lowest accuracy across all users (min. 3 attempts)</p>
            </CardHeader>
            <CardBody className="space-y-2">
              {mostDifficult.length === 0 ? (
                <p className="text-sm text-foreground-muted">Not enough attempt data yet.</p>
              ) : (
                mostDifficult.map((q, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 border-b border-border pb-2 text-sm last:border-0">
                    <span className="text-foreground">{q.text}</span>
                    <Badge variant="warning">{q.accuracy.toFixed(0)}%</Badge>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-foreground">Content Freshness</h2>
              <p className="text-xs text-foreground-muted">Topics not validated in 180+ days</p>
            </CardHeader>
            <CardBody>
              {staleTopics.length === 0 ? (
                <p className="text-sm text-foreground-muted">All topics validated within the last 180 days.</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {staleTopics.map((t) => (
                    <li key={t.id} className="flex justify-between border-b border-border pb-1.5 last:border-0">
                      <span className="text-foreground">{t.name}</span>
                      <span className="text-foreground-muted">{t.lastValidatedAt ? t.lastValidatedAt.toLocaleDateString() : "never validated"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="font-semibold text-foreground">Question Quality Distribution</h2>
              <p className="text-xs text-foreground-muted">Quality &lt; 80 → practice only · ≥ 80 → exam eligible · ≥ 90 → preferred for exams</p>
            </CardHeader>
            <CardBody className="grid grid-cols-3 gap-4 text-center">
              {qualityBuckets.map((b, i) => (
                <div key={i}>
                  <p className="text-2xl font-bold text-foreground">{b._count}</p>
                  <p className="text-xs text-foreground-muted">
                    {b.examPreferred ? "Preferred (≥90)" : b.examEligible ? "Eligible (80-89)" : "Practice only (<80)"}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs text-foreground-muted">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </CardBody>
    </Card>
  );
}
