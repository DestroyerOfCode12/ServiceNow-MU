import { NextResponse } from "next/server";
import { z } from "zod";
import { ValidationStatus, ContentAuditAction } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-user";
import { computeQualityScore, EXAM_ELIGIBLE_THRESHOLD, EXAM_PREFERRED_THRESHOLD } from "@/lib/validation/quality-score";

const bodySchema = z.object({
  status: z.nativeEnum(ValidationStatus),
  notes: z.string().max(2000).optional(),
});

/** Admin review-queue actions: Approve / Reject / Retire / Revalidate (spec section 58). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, error } = await requireAdmin();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input." }, { status: 400 });

  const question = await prisma.question.findUnique({ where: { id }, include: { options: true } });
  if (!question) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const qualityScore = computeQualityScore({
    hasExplanation: question.explanation.length > 0,
    explanationLength: question.explanation.length,
    optionCount: question.options.length,
    importMatchConfidence: 1,
    requiredSelectionCountConsistent: true,
    validationStatus: parsed.data.status,
    hasOfficialSource: !!question.officialSourceUrl,
    questionType: question.questionType,
  });

  const updated = await prisma.question.update({
    where: { id },
    data: {
      validationStatus: parsed.data.status,
      validationNotes: parsed.data.notes ?? question.validationNotes,
      lastValidatedAt: new Date(),
      qualityScore,
      examEligible: qualityScore >= EXAM_ELIGIBLE_THRESHOLD,
      examPreferred: qualityScore >= EXAM_PREFERRED_THRESHOLD,
    },
  });

  await prisma.questionValidation.create({
    data: {
      questionId: id,
      status: parsed.data.status,
      validatedById: user!.id,
      isAutomated: false,
      notes: parsed.data.notes ?? `Manually set to ${parsed.data.status} by admin.`,
    },
  });

  await prisma.contentAuditLog.create({
    data: {
      entityType: "question",
      entityId: id,
      action: ContentAuditAction.VALIDATE,
      actorId: user!.id,
      before: { validationStatus: question.validationStatus },
      after: { validationStatus: parsed.data.status },
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json({ question: updated });
}
