import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDomainAccuracies, getTopicAccuracies } from "@/lib/exam/weakness";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PROGRESS_TABS } from "@/components/nav/nav-links";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DomainPerformanceChart } from "@/components/charts/domain-performance-chart";
import { ProgressBar } from "@/components/ui/progress-bar";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/progress");

  const [domains, topics] = await Promise.all([getDomainAccuracies(user.id), getTopicAccuracies(user.id)]);

  return (
    <div>
      <SubTabs tabs={PROGRESS_TABS} />
      <div className="container-page py-10">
        <h1 className="text-2xl font-bold text-foreground">Performance</h1>

        {domains.every((d) => d.questionsAnswered === 0) ? (
          <p className="mt-6 text-sm text-foreground-muted">Answer some questions in Practice or a full exam to see your performance here.</p>
        ) : (
          <>
            <Card className="mt-6">
              <CardHeader>
                <h2 className="font-semibold text-foreground">By Domain</h2>
              </CardHeader>
              <CardBody>
                <DomainPerformanceChart
                  data={domains.map((d) => ({
                    domain: `${d.domainCode} — ${d.domainName}`,
                    correct: d.correctAnswers,
                    total: d.questionsAnswered,
                    accuracy: d.accuracy,
                  }))}
                />
              </CardBody>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <h2 className="font-semibold text-foreground">By Topic</h2>
              </CardHeader>
              <CardBody>
                {topics.length === 0 ? (
                  <p className="text-sm text-foreground-muted">Practice more questions per topic (at least 3) to see topic-level accuracy.</p>
                ) : (
                  <div className="space-y-3">
                    {topics.map((t) => (
                      <div key={t.topicId}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{t.topicName}</span>
                          <span className="text-foreground-muted">
                            {t.accuracy.toFixed(0)}% ({t.questionsAnswered})
                          </span>
                        </div>
                        <ProgressBar value={t.accuracy} className="mt-1" barClassName={t.accuracy < 60 ? "bg-danger" : t.accuracy < 80 ? "bg-warning" : "bg-success"} />
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
