import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { EXAM_TABS } from "@/components/nav/nav-links";
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

export default async function ExamHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/exams/history");

  const attempts = await prisma.examAttempt.findMany({
    where: { userId: user.id, status: { in: ["SUBMITTED", "EXPIRED"] } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <SubTabs tabs={EXAM_TABS} />
      <div className="container-page py-10">
        <h1 className="text-2xl font-bold text-foreground">Exam History</h1>

        {attempts.length === 0 ? (
          <p className="mt-6 text-sm text-foreground-muted">No completed attempts yet.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {attempts.map((a) => (
              <Card key={a.id}>
                <CardBody className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{MODE_LABELS[a.mode] ?? a.mode}</p>
                    <p className="text-sm text-foreground-muted">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : new Date(a.createdAt).toLocaleString()}
                      {a.status === "EXPIRED" && " · auto-submitted at time limit"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={a.scorePercent != null && a.scorePercent >= 70 ? "success" : "warning"}>
                      {a.correctCount} / {a.totalQuestions} · {a.scorePercent?.toFixed(0) ?? 0}%
                    </Badge>
                    <Link href={`/attempt/${a.id}/results`} className="text-sm font-medium text-accent hover:underline">
                      View results →
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
