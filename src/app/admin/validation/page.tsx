import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { ADMIN_TABS } from "@/components/nav/nav-links";
import { Card, CardBody } from "@/components/ui/card";
import { ValidationBadge } from "@/components/validation-badge";
import { QueueActions } from "./queue-actions";

export default async function ValidationQueuePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/admin/validation");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const questions = await prisma.question.findMany({
    where: { validationStatus: { in: ["NEEDS_REVIEW", "DRAFT"] } },
    include: { domain: true, topic: true, validations: { orderBy: { validatedAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <SubTabs tabs={ADMIN_TABS} />
      <div className="container-page py-10">
        <h1 className="text-2xl font-bold text-foreground">Content Review Queue</h1>
        <p className="mt-1 text-foreground-muted">{questions.length} questions need review</p>

        <div className="mt-6 space-y-4">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardBody>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <ValidationBadge status={q.validationStatus} />
                  <span className="text-foreground-muted">{q.domain.name}</span>
                  {q.topic && <span className="text-foreground-muted">· {q.topic.name}</span>}
                  <span className="ml-auto">
                    <Link href={`/admin/questions/${q.id}`} className="font-medium text-accent hover:underline">
                      Open editor →
                    </Link>
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-foreground">{q.questionText}</p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Reason: {q.validations[0]?.notes ?? q.validationNotes ?? "No validation notes on file."}
                </p>
                <div className="mt-3">
                  <QueueActions questionId={q.id} />
                </div>
              </CardBody>
            </Card>
          ))}
          {questions.length === 0 && <p className="text-sm text-foreground-muted">Nothing needs review right now.</p>}
        </div>
      </div>
    </div>
  );
}
