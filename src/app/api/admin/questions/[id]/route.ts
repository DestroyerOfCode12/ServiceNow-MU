import { NextResponse } from "next/server";
import { z } from "zod";
import { ContentAuditAction, Difficulty } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-user";

const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1),
  isCorrect: z.boolean(),
});

const bodySchema = z.object({
  questionText: z.string().min(5),
  explanation: z.string().min(1),
  examTip: z.string().optional().nullable(),
  difficulty: z.nativeEnum(Difficulty),
  domainId: z.string().cuid(),
  topicId: z.string().cuid().optional().nullable(),
  officialSourceTitle: z.string().optional().nullable(),
  officialSourceUrl: z.string().url().optional().nullable(),
  requiredSelectionCount: z.number().int().min(1).max(10).optional().nullable(),
  options: z.array(optionSchema).min(2).max(10),
  changeSummary: z.string().max(500).optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, error } = await requireAdmin();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  const body = parsed.data;

  if (!body.options.some((o) => o.isCorrect)) {
    return NextResponse.json({ error: "At least one option must be marked correct." }, { status: 400 });
  }

  const existing = await prisma.question.findUnique({ where: { id }, include: { options: true } });
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const before = {
    questionText: existing.questionText,
    explanation: existing.explanation,
    options: existing.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
  };

  const updated = await prisma.$transaction(async (tx) => {
    await tx.questionOption.deleteMany({ where: { questionId: id } });
    const q = await tx.question.update({
      where: { id },
      data: {
        questionText: body.questionText,
        explanation: body.explanation,
        examTip: body.examTip,
        difficulty: body.difficulty,
        domainId: body.domainId,
        topicId: body.topicId,
        officialSourceTitle: body.officialSourceTitle,
        officialSourceUrl: body.officialSourceUrl,
        requiredSelectionCount: body.requiredSelectionCount,
        currentVersionNumber: { increment: 1 },
        options: {
          create: body.options.map((o, idx) => ({ text: o.text, isCorrect: o.isCorrect, sortOrder: idx })),
        },
      },
      include: { options: true },
    });

    await tx.questionVersion.create({
      data: {
        questionId: id,
        versionNumber: q.currentVersionNumber,
        status: q.validationStatus,
        snapshot: {
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
          explanation: q.explanation,
        },
        changeSummary: body.changeSummary ?? "Edited via admin content editor.",
        createdById: user!.id,
      },
    });

    await tx.contentAuditLog.create({
      data: {
        entityType: "question",
        entityId: id,
        action: ContentAuditAction.UPDATE,
        actorId: user!.id,
        before,
        after: { questionText: q.questionText, explanation: q.explanation, options: before.options },
        notes: body.changeSummary,
      },
    });

    return q;
  });

  return NextResponse.json({ question: updated });
}
