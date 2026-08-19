/**
 * Pure answer-correctness check, shared by scoring and tests. No partial
 * credit for multiple-select: the selected set must exactly equal the
 * correct set (extra or missing selections both count as incorrect).
 */
export function isAnswerCorrect(correctOptionIds: string[], selectedOptionIds: string[]): boolean {
  if (selectedOptionIds.length === 0) return false;
  const a = [...correctOptionIds].sort();
  const b = [...selectedOptionIds].sort();
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}
