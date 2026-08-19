import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { computeReadiness } from "@/lib/exam/readiness";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PROGRESS_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";

const COMPONENT_LABELS: Record<string, string> = {
  lifetimeAccuracy: "Lifetime accuracy",
  recentAccuracy: "Recent accuracy (last 50 answers)",
  domainCoverage: "Domain coverage",
  weakTopicPerformance: "Weak-topic performance",
  fullExamPerformance: "Full-exam performance",
  consistency: "Consistency (study streak)",
};

export default async function ReadinessPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/progress/readiness");

  const readiness = await computeReadiness(user.id);

  return (
    <div>
      <SubTabs tabs={PROGRESS_TABS} />
      <div className="container-page max-w-2xl py-10">
        <h1 className="text-2xl font-bold text-foreground">CSA Practice Readiness</h1>

        <Card className="mt-6">
          <CardBody className="text-center">
            <p className="text-5xl font-bold text-foreground">{readiness.score} / 100</p>
            <p className="mt-1 text-lg font-semibold text-accent">{readiness.band}</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-foreground-muted">
              An internal readiness signal built from your activity on this platform — it does not predict the real
              ServiceNow exam with certainty.
            </p>
          </CardBody>
        </Card>

        <Card className="mt-6">
          <CardBody>
            <p className="mb-4 text-sm font-semibold text-foreground">How it&apos;s calculated</p>
            <div className="space-y-4">
              {Object.entries(readiness.components).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">{COMPONENT_LABELS[key] ?? key}</span>
                    <span className="font-medium text-foreground">{value.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={value} className="mt-1" />
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="mt-6">
          <CardBody>
            <p className="mb-2 text-sm font-semibold text-foreground">Recommended</p>
            <ul className="space-y-1.5 text-sm text-foreground-muted">
              {readiness.recommendations.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
