import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/current-user";
import { enforceDeadline } from "@/lib/exam/attempt-guard";

const bodySchema = z.object({
  examQuestionId: z.string().cuid(),
  flagged: z.boolean(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: attemptId } = await params;
  const { user, error } = await requireUser();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const guard = await enforceDeadline(attemptId, user!.id);
  if (guard.expired) return NextResponse.json({ error: "Time is up — this attempt has been submitted." }, { status: 409 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });

  const examQuestion = await prisma.examQuestion.findUnique({ where: { id: parsed.data.examQuestionId }, include: { attempt: true } });
  if (!examQuestion || examQuestion.attemptId !== attemptId || examQuestion.attempt.userId !== user!.id) {
    return NextResponse.json({ error: "Question not found in this attempt." }, { status: 404 });
  }

  await prisma.examQuestion.update({ where: { id: examQuestion.id }, data: { isFlagged: parsed.data.flagged } });
  return NextResponse.json({ ok: true });
}
