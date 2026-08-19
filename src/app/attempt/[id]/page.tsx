import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { AttemptRunner } from "./attempt-runner";
import type { ClientAttempt } from "@/lib/exam/types";

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/attempt/${id}`);

  const attempt = await prisma.examAttempt.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: {
          question: { include: { options: true, topic: true, domain: true } },
          answer: true,
        },
      },
    },
  });

  if (!attempt || attempt.userId !== user.id) notFound();

  if (attempt.status !== "IN_PROGRESS") {
    redirect(`/attempt/${id}/results`);
  }

  const clientAttempt: ClientAttempt = {
    attemptId: attempt.id,
    mode: attempt.mode,
    totalQuestions: attempt.totalQuestions,
    serverDeadlineAt: attempt.serverDeadlineAt?.toISOString() ?? null,
    durationSeconds: attempt.durationSeconds,
    startedAt: attempt.startedAt.toISOString(),
    questions: attempt.questions.map((eq) => {
      const orderIds = eq.optionOrder as string[];
      const optionsById = new Map(eq.question.options.map((o) => [o.id, o]));
      return {
        examQuestionId: eq.id,
        orderIndex: eq.orderIndex,
        questionText: eq.question.questionText,
        questionType: eq.question.questionType,
        requiredSelectionCount: eq.question.requiredSelectionCount,
        difficulty: eq.difficultySnapshot,
        domainName: eq.question.domain.name,
        topicName: eq.question.topic?.name ?? null,
        topicSlug: eq.question.topic?.slug ?? null,
        isFlagged: eq.isFlagged,
        selectedOptionIds: (eq.answer?.selectedOptionIds as string[] | undefined) ?? [],
        confidenceRating: eq.answer?.confidenceRating ?? null,
        options: orderIds
          .map((id) => optionsById.get(id))
          .filter((o): o is NonNullable<typeof o> => !!o)
          .map((o) => ({ id: o.id, text: o.text })),
      };
    }),
  };

  return <AttemptRunner attempt={clientAttempt} />;
}
