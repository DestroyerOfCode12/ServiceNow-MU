import { describe, it, expect } from "vitest";
import { computeQualityScore, EXAM_ELIGIBLE_THRESHOLD, EXAM_PREFERRED_THRESHOLD } from "./quality-score";
import { QuestionType, ValidationStatus } from "@prisma/client";

const base = {
  hasExplanation: true,
  explanationLength: 200,
  optionCount: 4,
  importMatchConfidence: 0.98,
  requiredSelectionCountConsistent: true,
  hasOfficialSource: true,
  questionType: QuestionType.SINGLE_CHOICE,
};

describe("computeQualityScore", () => {
  it("scores a fully verified, well-sourced question at or above the exam-preferred threshold", () => {
    const score = computeQualityScore({ ...base, validationStatus: ValidationStatus.VERIFIED });
    expect(score).toBeGreaterThanOrEqual(EXAM_PREFERRED_THRESHOLD);
  });

  it("keeps an unverified/needs-review question below the exam-eligible threshold", () => {
    const score = computeQualityScore({ ...base, validationStatus: ValidationStatus.NEEDS_REVIEW, hasOfficialSource: false });
    expect(score).toBeLessThan(EXAM_ELIGIBLE_THRESHOLD);
  });

  it("scores a rejected question at exactly 0", () => {
    const score = computeQualityScore({ ...base, validationStatus: ValidationStatus.REJECTED });
    expect(score).toBe(0);
  });

  it("penalizes low import-match confidence", () => {
    const high = computeQualityScore({ ...base, validationStatus: ValidationStatus.VERIFIED, importMatchConfidence: 0.98 });
    const low = computeQualityScore({ ...base, validationStatus: ValidationStatus.VERIFIED, importMatchConfidence: 0.4 });
    expect(low).toBeLessThan(high);
  });

  it("keeps a verified question with NO explanation at all below the exam-eligible threshold", () => {
    const score = computeQualityScore({ ...base, hasExplanation: false, explanationLength: 0, validationStatus: ValidationStatus.VERIFIED });
    expect(score).toBeLessThan(EXAM_ELIGIBLE_THRESHOLD);
  });

  it("never returns a value outside 0-100", () => {
    const score = computeQualityScore({
      ...base,
      hasExplanation: false,
      explanationLength: 0,
      optionCount: 2,
      importMatchConfidence: 0,
      requiredSelectionCountConsistent: false,
      validationStatus: ValidationStatus.OUTDATED,
      hasOfficialSource: false,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
