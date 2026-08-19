import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getTopicAccuracies } from "@/lib/exam/weakness";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PRACTICE_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { StartAttemptButton } from "@/components/exam/start-attempt-button";
import { Badge } from "@/components/ui/badge";

export default async function WeakAreasPracticePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/practice/weak-areas");

  const accuracies = await getTopicAccuracies(user.id);
  const weak = accuracies.filter((a) => a.accuracy < 75).slice(0, 6);

  return (
    <div>
      <SubTabs tabs={PRACTICE_TABS} />
      <div className="container-page max-w-2xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Smart Practice — Weak Areas</h1>
        <p className="mt-1 text-foreground-muted">
          Automatically weighted toward the topics you&apos;re missing most, with a mixed slice so it doesn&apos;t
          get monotonous. Difficulty increases as your accuracy improves.
        </p>

        <Card className="mt-6">
          <CardBody>
            {accuracies.length === 0 ? (
              <p className="text-sm text-foreground-muted">
                Answer at least a few questions in Quick Practice or a full exam first — we need some data before we
                can target your weak areas.
              </p>
            ) : weak.length === 0 ? (
              <p className="text-sm text-foreground-muted">
                No clear weak areas detected yet — nice work. We&apos;ll still mix in a broad practice set below.
              </p>
            ) : (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-foreground">Your weakest areas right now</p>
                <ol className="space-y-1.5">
                  {weak.map((t, i) => (
                    <li key={t.topicId} className="flex items-center gap-2 text-sm">
                      <span className="text-foreground-muted">{i + 1}.</span>
                      <span className="text-foreground">{t.topicName}</span>
                      <Badge variant="warning">{t.accuracy.toFixed(0)}%</Badge>
                      <span className="ml-auto text-xs text-foreground-muted">{t.domainName}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <StartAttemptButton request={{ mode: "WEAK_AREA_PRACTICE", count: 20 }} className="w-full">
              Start Smart Practice (20 questions)
            </StartAttemptButton>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
