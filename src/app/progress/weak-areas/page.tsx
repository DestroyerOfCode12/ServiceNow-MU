import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getTopicAccuracies } from "@/lib/exam/weakness";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PROGRESS_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function WeakAreasProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/progress/weak-areas");

  const topics = await getTopicAccuracies(user.id);
  const weak = topics.filter((t) => t.accuracy < 75);

  return (
    <div>
      <SubTabs tabs={PROGRESS_TABS} />
      <div className="container-page max-w-2xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Your Weak Areas</h1>

        {topics.length === 0 ? (
          <p className="mt-6 text-sm text-foreground-muted">Not enough data yet — answer at least 3 questions per topic to see this.</p>
        ) : weak.length === 0 ? (
          <p className="mt-6 text-sm text-foreground-muted">No weak areas detected — great work. Keep practicing to maintain it.</p>
        ) : (
          <Card className="mt-6">
            <CardBody>
              <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground-muted">Your weak areas</p>
              <ol className="space-y-3">
                {weak.map((t, i) => (
                  <li key={t.topicId} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {i + 1}. {t.topicName}
                      </p>
                      <p className="text-xs text-foreground-muted">
                        {t.domainName} · {t.questionsAnswered} questions answered
                      </p>
                    </div>
                    <Badge variant={t.accuracy < 50 ? "danger" : "warning"}>{t.accuracy.toFixed(0)}%</Badge>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm text-foreground-muted">
                We recommend studying <strong className="text-foreground">{weak[0].topicName}</strong> next.
              </p>
              <LinkButton href="/practice/weak-areas" className="mt-4">
                Start Smart Practice
              </LinkButton>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
