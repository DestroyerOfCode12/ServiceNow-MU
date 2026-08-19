import { QuestionType, ValidationStatus } from "@prisma/client";

/**
 * Question Quality System (spec section 57). A transparent, documented 0-100
 * score that gates full-exam eligibility:
 *   < 80            → practice only
 *   >= 80            → eligible for exams
 *   >= 90            → preferred for exams
 *
 * This is a heuristic scoring rubric, not a black box — every factor below is
 * something an admin can see and override in the content editor.
 */
export interface QualityScoreInput {
  hasExplanation: boolean;
  explanationLength: number;
  optionCount: number;
  importMatchConfidence: number; // 0-1
  requiredSelectionCountConsistent: boolean;
  validationStatus: ValidationStatus;
  hasOfficialSource: boolean;
  questionType: QuestionType;
}

export function computeQualityScore(input: QualityScoreInput): number {
  let score = 40; // baseline: a syntactically complete, imported question

  if (input.hasExplanation && input.explanationLength > 40) score += 15;
  else if (input.hasExplanation) score += 5;
  else score -= 15; // no explanation at all is a real gap for a study platform — never let it hide behind a source/status bonus

  if (input.importMatchConfidence >= 0.95) score += 10;
  else if (input.importMatchConfidence >= 0.85) score += 6;
  else if (input.importMatchConfidence < 0.6) score -= 15;

  if (input.optionCount >= 4) score += 5;
  if (input.requiredSelectionCountConsistent) score += 5;

  if (input.validationStatus === ValidationStatus.VERIFIED && input.hasOfficialSource) score += 25;
  else if (input.validationStatus === ValidationStatus.NEEDS_REVIEW) score -= 5;
  else if (input.validationStatus === ValidationStatus.OUTDATED) score -= 30;
  else if (input.validationStatus === ValidationStatus.REJECTED) score = 0;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export const EXAM_ELIGIBLE_THRESHOLD = 80;
export const EXAM_PREFERRED_THRESHOLD = 90;
