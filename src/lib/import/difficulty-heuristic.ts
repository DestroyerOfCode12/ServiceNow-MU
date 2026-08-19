import { Difficulty, QuestionType } from "@prisma/client";

/**
 * Deterministic, documented difficulty heuristic applied at import time (the
 * study guide did not label difficulty). Admins can override per-question in
 * the content editor — this is a starting estimate, not a claim of
 * psychometric calibration.
 */
export function estimateDifficulty(params: { questionText: string; questionType: QuestionType }): Difficulty {
  let score = params.questionType === QuestionType.MULTIPLE_SELECT ? 2 : 1;
  if (params.questionText.length > 120) score += 1;
  if (/administrator (wants|needs)|scenario|which configuration should/i.test(params.questionText)) score += 1;

  if (score <= 1) return Difficulty.EASY;
  if (score === 2) return Difficulty.MEDIUM;
  return Difficulty.HARD;
}
