/**
 * Initial Content Audit (spec section 61). Run with `npm run db:audit`.
 * Produces the admin-facing summary report over every question currently in
 * the database — validation status breakdown, missing sources, conflicts,
 * and a few heuristics for potentially ambiguous content. Writes a copy to
 * ./content-audit-report.md alongside the console summary.
 */
import { writeFileSync } from "fs";
import { prisma } from "../src/lib/prisma";
import { DocumentationValidator } from "../src/lib/validation/documentation-validator";
import { EXAM_ELIGIBLE_THRESHOLD } from "../src/lib/validation/quality-score";

async function main() {
  const questions = await prisma.question.findMany({
    include: { options: true, domain: true, topic: true, validations: { where: { hasConflict: true } } },
  });

  const total = questions.length;
  const byStatus = {
    VERIFIED: questions.filter((q) => q.validationStatus === "VERIFIED").length,
    NEEDS_REVIEW: questions.filter((q) => q.validationStatus === "NEEDS_REVIEW").length,
    OUTDATED: questions.filter((q) => q.validationStatus === "OUTDATED").length,
    REJECTED: questions.filter((q) => q.validationStatus === "REJECTED").length,
    DRAFT: questions.filter((q) => q.validationStatus === "DRAFT").length,
  };

  const missingSource = questions.filter((q) => !q.officialSourceUrl);
  const withConflicts = questions.filter((q) => q.validations.length > 0);

  // Heuristic ambiguity flags an admin should look at: no explanation, fewer
  // than 3 options, or more than one option marked correct on a
  // single_choice question (a real data-integrity problem, not just style).
  const potentiallyAmbiguous = questions.filter((q) => {
    const noExplanation = !q.explanation || q.explanation === "Explanation pending admin review.";
    const tooFewOptions = q.options.length < 3;
    const correctCount = q.options.filter((o) => o.isCorrect).length;
    const singleChoiceMultipleCorrect = q.questionType === "SINGLE_CHOICE" && correctCount !== 1;
    const multiSelectCountMismatch = q.questionType === "MULTIPLE_SELECT" && q.requiredSelectionCount !== correctCount;
    return noExplanation || tooFewOptions || singleChoiceMultipleCorrect || multiSelectCountMismatch;
  });

  const staleTopics = await prisma.topic.findMany();
  const staleCount = staleTopics.filter((t) => DocumentationValidator.isStale(t.lastValidatedAt)).length;

  const examEligible = questions.filter((q) => q.qualityScore >= EXAM_ELIGIBLE_THRESHOLD).length;

  const byDomain = new Map<string, number>();
  for (const q of questions) byDomain.set(q.domain.name, (byDomain.get(q.domain.name) ?? 0) + 1);

  const lines: string[] = [];
  lines.push("# CSA Prep Platform — Initial Content Audit");
  lines.push(`Generated: ${new Date().toISOString()}\n`);
  lines.push(`**TOTAL: ${total}**\n`);
  lines.push(`- Verified: ${byStatus.VERIFIED}`);
  lines.push(`- Needs Review: ${byStatus.NEEDS_REVIEW}`);
  lines.push(`- Outdated: ${byStatus.OUTDATED}`);
  lines.push(`- Rejected: ${byStatus.REJECTED}`);
  lines.push(`- Draft: ${byStatus.DRAFT}\n`);
  lines.push(`- Missing official source: ${missingSource.length}`);
  lines.push(`- Potential answer conflicts flagged: ${withConflicts.length}`);
  lines.push(`- Potentially ambiguous (heuristic): ${potentiallyAmbiguous.length}`);
  lines.push(`- Exam-eligible (quality ≥ ${EXAM_ELIGIBLE_THRESHOLD}): ${examEligible} / ${total}`);
  lines.push(`- Topics stale (>180 days since validation, or never validated): ${staleCount} / ${staleTopics.length}\n`);
  lines.push("## By Domain\n");
  for (const [domain, count] of byDomain) lines.push(`- ${domain}: ${count}`);

  if (withConflicts.length > 0) {
    lines.push("\n## Questions With Flagged Source Conflicts\n");
    for (const q of withConflicts) lines.push(`- [${q.domain.name}] ${q.questionText}`);
  }

  if (missingSource.length > 0) {
    lines.push("\n## Sample of Questions Missing an Official Source (first 15)\n");
    for (const q of missingSource.slice(0, 15)) lines.push(`- [${q.domain.name} / ${q.topic?.name ?? "unassigned"}] ${q.questionText}`);
  }

  const report = lines.join("\n");
  console.log(report);
  writeFileSync("content-audit-report.md", report + "\n");
  console.log("\nWritten to content-audit-report.md");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
