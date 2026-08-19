import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { PROGRESS_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MODE_LABELS: Record<string, string> = {
  FULL_EXAM: "Full CSA Exam",
  TIMED_PRACTICE: "Timed Practice",
  QUICK_PRACTICE: "Quick Practice",
  TOPIC_PRACTICE: "Topic Practice",
  DOMAIN_PRACTICE: "Domain Practice",
  WEAK_AREA_PRACTICE: "Smart Practice",
  RANDOM_PRACTICE: "Random Practice",
};

export default async function StudyHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/progress/history");

  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id, status: { in: ["SUBMITTED", "EXPIRED"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <SubTabs tabs={PROGRESS_TABS} />
      <div className="container-page py-10">
        <h1 className="text-2xl font-bold text-foreground">Study History</h1>
        <p className="mt-1 text-foreground-muted">Every practice session and exam attempt you&apos;ve completed.</p>

        {attempts.length === 0 ? (
          <p className="mt-6 text-sm text-foreground-muted">Nothing here yet — start with Quick Practice.</p>
        ) : (
          <div className="mt-6 space-y-2">
            {attempts.map((a) => (
              <Card key={a.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{MODE_LABELS[a.mode] ?? a.mode}</p>
                    <p className="text-xs text-foreground-muted">{new Date(a.submittedAt ?? a.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{a.totalQuestions} questions</Badge>
                    <Badge variant={a.scorePercent != null && a.scorePercent >= 70 ? "success" : "warning"}>
                      {a.scorePercent?.toFixed(0) ?? 0}%
                    </Badge>
                    <Link href={`/attempt/${a.id}/results`} className="text-sm font-medium text-accent hover:underline">
                      View →
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
