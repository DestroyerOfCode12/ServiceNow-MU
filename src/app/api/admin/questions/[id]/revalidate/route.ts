import { NextResponse } from "next/server";
import { ContentAuditAction, ValidationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/current-user";
import { DocumentationValidator } from "@/lib/validation/documentation-validator";
import { computeQualityScore, EXAM_ELIGIBLE_THRESHOLD, EXAM_PREFERRED_THRESHOLD } from "@/lib/validation/quality-score";

/**
 * Re-runs the automated topic-level validation check for one question — e.g.
 * after an admin has since attached a confirmed official source to its
 * topic. Never fabricates a source; only promotes to VERIFIED if the topic
 * genuinely has one on file.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, error } = await requireAdmin();
  if (error) return NextResponse.json({ error: error.message }, { status: error.status });

  const question = await prisma.question.findUnique({ where: { id }, include: { options: true, topic: { include: { sources: { include: { source: true } } } } } });
  if (!question) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const primarySource = question.topic?.sources[0]?.source;
  const topicVerified = question.topic?.validationStatus === ValidationStatus.VERIFIED && !!primarySource;

  const result = DocumentationValidator.validateQuestionAgainstTopic(
    {
      questionText: question.questionText,
      explanation: question.explanation,
      correctOptionTexts: question.options.filter((o) => o.isCorrect).map((o) => o.text),
      importMatchConfidence: 1,
    },
    { hasVerifiedSource: topicVerified, sourceTitle: primarySource?.title, sourceUrl: primarySource?.url },
  );

  const qualityScore = computeQualityScore({
    hasExplanation: question.explanation.length > 0,
    explanationLength: question.explanation.length,
    optionCount: question.options.length,
    importMatchConfidence: 1,
    requiredSelectionCountConsistent: true,
    validationStatus: result.status,
    hasOfficialSource: topicVerified,
    questionType: question.questionType,
  });

  const updated = await prisma.question.update({
    where: { id },
    data: {
      validationStatus: result.status,
      validationNotes: result.notes,
      lastValidatedAt: new Date(),
      officialSourceTitle: topicVerified ? primarySource!.title : question.officialSourceTitle,
      officialSourceUrl: topicVerified ? primarySource!.url : question.officialSourceUrl,
      qualityScore,
      examEligible: qualityScore >= EXAM_ELIGIBLE_THRESHOLD,
      examPreferred: qualityScore >= EXAM_PREFERRED_THRESHOLD,
    },
  });

  await prisma.questionValidation.create({
    data: { questionId: id, status: result.status, validatedById: user!.id, isAutomated: true, notes: result.notes },
  });
  await prisma.contentAuditLog.create({
    data: {
      entityType: "question",
      entityId: id,
      action: ContentAuditAction.REVALIDATE,
      actorId: user!.id,
      after: { validationStatus: result.status },
      notes: "Revalidation re-run from admin queue.",
    },
  });

  return NextResponse.json({ question: updated });
}
