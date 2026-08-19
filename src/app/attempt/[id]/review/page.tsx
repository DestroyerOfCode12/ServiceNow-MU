import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/current-user";
import { loadAttemptDetail } from "@/lib/exam/attempt-analysis";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { clsx } from "clsx";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/attempt/${id}/review`);

  const attempt = await loadAttemptDetail(id);
  if (!attempt || attempt.userId !== user.id) notFound();
  if (attempt.status === "IN_PROGRESS") redirect(`/attempt/${id}`);

  return (
    <div className="container-page py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">Review Answers</h1>
        <LinkButton href={`/attempt/${id}/results`} variant="secondary" size="sm">
          Back to results
        </LinkButton>
      </div>

      <div className="mt-6 space-y-6">
        {attempt.questions.map((eq, i) => {
          const selected: string[] = Array.isArray(eq.answer?.selectedOptionIds) ? (eq.answer!.selectedOptionIds as string[]) : [];
          const correctIds = eq.question.options.filter((o) => o.isCorrect).map((o) => o.id);
          const isCorrect = eq.answer?.isCorrect ?? false;
          const wasAnswered = selected.length > 0;

          return (
            <Card key={eq.id} id={`q-${i + 1}`}>
              <CardBody>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-foreground-muted">Question {i + 1}</span>
                  <Badge variant="info">{eq.question.domain.name}</Badge>
                  {eq.question.topic && <Badge>{eq.question.topic.name}</Badge>}
                  <Badge variant="neutral">{eq.difficultySnapshot}</Badge>
                  {!wasAnswered ? (
                    <Badge variant="warning">Unanswered</Badge>
                  ) : isCorrect ? (
                    <Badge variant="success">Correct</Badge>
                  ) : (
                    <Badge variant="danger">Incorrect</Badge>
                  )}
                </div>

                <p className="font-medium text-foreground">{eq.question.questionText}</p>

                <ul className="mt-3 space-y-1.5">
                  {eq.question.options.map((opt, oi) => {
                    const wasSelected = selected.includes(opt.id);
                    const isRight = correctIds.includes(opt.id);
                    return (
                      <li
                        key={opt.id}
                        className={clsx(
                          "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
                          isRight
                            ? "border-success bg-success-bg text-success"
                            : wasSelected
                              ? "border-danger bg-danger-bg text-danger"
                              : "border-border text-foreground-muted",
                        )}
                      >
                        <span className="font-semibold">{String.fromCharCode(65 + oi)}.</span>
                        <span className="flex-1">{opt.text}</span>
                        {isRight && <span className="text-xs font-medium">Correct answer</span>}
                        {wasSelected && !isRight && <span className="text-xs font-medium">Your answer</span>}
                      </li>
                    );
                  })}
                </ul>

                {!isCorrect && wasAnswered && (
                  <p className="mt-3 rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
                    <strong>Why you were wrong:</strong> your selection doesn&apos;t match the correct answer above —
                    see the explanation below for the underlying concept.
                  </p>
                )}

                <div className="mt-3 rounded-md bg-surface-muted px-3 py-3 text-sm text-foreground">
                  <p className="mb-1 font-medium">{isCorrect ? "Explanation" : "Correct concept"}</p>
                  <p className="text-foreground-muted">{eq.question.explanation}</p>
                  {eq.question.examTip && <p className="mt-2 text-xs text-foreground-muted">Exam tip: {eq.question.examTip}</p>}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                  {eq.question.officialSourceUrl ? (
                    <a
                      href={eq.question.officialSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-accent hover:underline"
                    >
                      Official documentation: {eq.question.officialSourceTitle ?? "View source"} ↗
                    </a>
                  ) : (
                    <span className="text-foreground-muted">This content has not yet been verified against current official ServiceNow documentation.</span>
                  )}
                  {eq.question.topic && (
                    <Link href={`/study/topics/${eq.question.topic.slug}`} className="font-medium text-accent hover:underline">
                      Learn more →
                    </Link>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
