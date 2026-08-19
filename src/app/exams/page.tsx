import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { EXAM_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { StartAttemptButton } from "@/components/exam/start-attempt-button";

export const metadata: Metadata = { title: "Exams · CSA Prep Platform" };

export default async function FullExamPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/exams");

  const blueprint = await prisma.blueprintVersion.findFirst({
    where: { status: "ACTIVE" },
    include: { domains: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div>
      <SubTabs tabs={EXAM_TABS} />
      <div className="container-page max-w-3xl py-10">
        <h1 className="text-2xl font-bold text-foreground">Full CSA Exam</h1>
        <p className="mt-1 text-foreground-muted">
          A realistic, full-length simulation modeled on the public CSA exam blueprint — not a reproduction of actual
          ServiceNow exam content.
        </p>

        {blueprint ? (
          <>
            <Card className="mt-6">
              <CardBody className="grid gap-4 sm:grid-cols-3">
                <Stat label="Questions" value={String(blueprint.questionCount)} />
                <Stat label="Time limit" value={`${blueprint.examDurationMinutes} minutes`} />
                <Stat label="Blueprint" value={blueprint.version} />
              </CardBody>
            </Card>

            <Card className="mt-4">
              <CardBody>
                <p className="mb-3 text-sm font-medium text-foreground">Domain weighting</p>
                <ul className="space-y-1.5 text-sm">
                  {blueprint.domains.map((d) => (
                    <li key={d.id} className="flex items-center justify-between border-b border-border pb-1.5 last:border-0">
                      <span className="text-foreground">
                        {d.code} — {d.name}
                      </span>
                      <span className="font-medium text-foreground-muted">{d.weightPercent}%</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <div className="mt-6 rounded-md bg-warning-bg px-4 py-3 text-sm text-warning">
              Once started, the timer cannot be paused and the question set is locked for this attempt. Make sure
              you have {blueprint.examDurationMinutes} uninterrupted minutes before beginning.
            </div>

            <StartAttemptButton request={{ mode: "FULL_EXAM" }} size="lg" className="mt-6 w-full sm:w-auto">
              Begin Full CSA Exam
            </StartAttemptButton>
          </>
        ) : (
          <p className="mt-6 text-sm text-danger">No active CSA blueprint is configured. Contact an administrator.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-foreground-muted">{label}</p>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
