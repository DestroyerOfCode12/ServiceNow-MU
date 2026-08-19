import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { SubTabs } from "@/components/nav/sub-tabs";
import { ADMIN_TABS } from "@/components/nav/nav-links";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ValidationBadge } from "@/components/validation-badge";
import { QuestionEditorForm } from "./editor-form";
import { QueueActions } from "../../validation/queue-actions";

export default async function QuestionEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/admin/questions/${id}`);
  if (user.role !== "ADMIN") redirect("/dashboard");

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      versions: { orderBy: { versionNumber: "desc" } },
      validations: { orderBy: { validatedAt: "desc" }, take: 10 },
    },
  });
  if (!question) notFound();

  const [domains, topics] = await Promise.all([
    prisma.examDomain.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.topic.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const original = question.originalImportedText as { correct_raw?: string; question_text?: string } | null;

  return (
    <div>
      <SubTabs tabs={ADMIN_TABS} />
      <div className="container-page grid max-w-6xl gap-6 py-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <ValidationBadge status={question.validationStatus} />
            <span className="text-sm text-foreground-muted">Quality score: {question.qualityScore}/100</span>
            <span className="text-sm text-foreground-muted">· v{question.currentVersionNumber}</span>
          </div>
          <Card>
            <CardHeader>
              <h1 className="font-semibold text-foreground">Edit Question</h1>
            </CardHeader>
            <CardBody>
              <QuestionEditorForm
                question={{
                  id: question.id,
                  questionText: question.questionText,
                  explanation: question.explanation,
                  examTip: question.examTip,
                  difficulty: question.difficulty,
                  domainId: question.domainId,
                  topicId: question.topicId,
                  officialSourceTitle: question.officialSourceTitle,
                  officialSourceUrl: question.officialSourceUrl,
                  requiredSelectionCount: question.requiredSelectionCount,
                  questionType: question.questionType,
                  options: question.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
                }}
                domains={domains.map((d) => ({ id: d.id, name: `${d.code} — ${d.name}` }))}
                topics={topics.map((t) => ({ id: t.id, name: t.name, domainId: t.domainId }))}
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-foreground">Validation actions</h2>
            </CardHeader>
            <CardBody>
              <QueueActions questionId={question.id} />
              <p className="mt-3 text-xs text-foreground-muted">
                Last validated: {question.lastValidatedAt ? question.lastValidatedAt.toLocaleString() : "never"}
              </p>
              {question.validationNotes && <p className="mt-2 text-xs text-foreground-muted">{question.validationNotes}</p>}
            </CardBody>
          </Card>

          {original?.correct_raw && (
            <Card>
              <CardHeader>
                <h2 className="text-sm font-semibold text-foreground">Original imported content</h2>
              </CardHeader>
              <CardBody>
                <p className="text-xs text-foreground-muted">Original source answer:</p>
                <p className="text-sm text-foreground">{original.correct_raw}</p>
                <p className="mt-2 text-xs text-foreground-muted">
                  Preserved for audit only — the current verified answer (above) is what users see.
                </p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-foreground">Validation history</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {question.validations.length === 0 && <p className="text-sm text-foreground-muted">No validation events yet.</p>}
              {question.validations.map((v) => (
                <div key={v.id} className="border-b border-border pb-2 text-xs last:border-0">
                  <div className="flex items-center gap-2">
                    <ValidationBadge status={v.status} />
                    <span className="text-foreground-muted">{v.validatedAt.toLocaleDateString()}</span>
                    {v.isAutomated && <span className="text-foreground-muted">(automated)</span>}
                  </div>
                  {v.notes && <p className="mt-1 text-foreground-muted">{v.notes}</p>}
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-sm font-semibold text-foreground">Previous versions</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              {question.versions.map((v) => (
                <div key={v.id} className="border-b border-border pb-2 text-xs last:border-0">
                  <p className="font-medium text-foreground">
                    Version {v.versionNumber} <ValidationBadge status={v.status} />
                  </p>
                  <p className="text-foreground-muted">{v.changeSummary}</p>
                  <p className="text-foreground-muted">{v.createdAt.toLocaleString()}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
