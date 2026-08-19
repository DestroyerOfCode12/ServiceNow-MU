import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import { enforceDeadline } from "@/lib/exam/attempt-guard";

const bodySchema = z.object({
  examQuestionId: z.string().cuid(),
  selectedOptionIds: z.array(z.string().cuid()).max(10),
  confidenceRating: z.number().int().min(1).max(5).optional(),
  responseTimeSeconds: z.number().int().min(0).max(24 * 60 * 60).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: attemptId } = await params;
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const guard = await enforceDeadline(attemptId, user!.id);
  if (guard.expired) return NextResponse.json({ error: "Time is up — this attempt has been submitted." }, { status: 409 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  const body = parsed.data;

  const examQuestion = await prisma.examQuestion.findUnique({
    where: { id: body.examQuestionId },
    include: { attempt: true, question: { include: { options: true } } },
  });
  if (!examQuestion || examQuestion.attemptId !== attemptId || examQuestion.attempt.userId !== user!.id) {
    return NextResponse.json({ error: "Question not found in this attempt." }, { status: 404 });
  }
  if (examQuestion.attempt.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "This attempt is no longer in progress." }, { status: 409 });
  }

  const validOptionIds = new Set(examQuestion.question.options.map((o) => o.id));
  if (body.selectedOptionIds.some((id) => !validOptionIds.has(id))) {
    return NextResponse.json({ error: "One or more selected options are invalid for this question." }, { status: 400 });
  }

  // Enforce multi-select selection-count constraints server-side too.
  if (examQuestion.question.questionType === "MULTIPLE_SELECT" && examQuestion.question.requiredSelectionCount) {
    if (body.selectedOptionIds.length > examQuestion.question.requiredSelectionCount) {
      return NextResponse.json(
        { error: `Select at most ${examQuestion.question.requiredSelectionCount} answer(s) for this question.` },
        { status: 400 },
      );
    }
  } else if (examQuestion.question.questionType === "SINGLE_CHOICE" && body.selectedOptionIds.length > 1) {
    return NextResponse.json({ error: "Only one answer may be selected for this question." }, { status: 400 });
  }

  await prisma.examAnswer.update({
    where: { examQuestionId: examQuestion.id },
    data: {
      selectedOptionIds: body.selectedOptionIds,
      confidenceRating: body.confidenceRating,
      responseTimeSeconds: body.responseTimeSeconds,
      answeredAt: body.selectedOptionIds.length > 0 ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true });
}
