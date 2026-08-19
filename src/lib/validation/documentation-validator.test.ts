import { describe, it, expect } from "vitest";
import { DocumentationValidator } from "./documentation-validator";
import { ValidationStatus } from "@prisma/client";

const baseInput = {
  questionText: "What does coalesce do?",
  explanation: "Coalesce determines update vs insert.",
  correctOptionTexts: ["Determines update vs insert"],
  importMatchConfidence: 0.97,
};

describe("DocumentationValidator.validateSourceUrl", () => {
  it("accepts an official ServiceNow docs URL", () => {
    expect(DocumentationValidator.validateSourceUrl("https://www.servicenow.com/docs/x.html").accepted).toBe(true);
  });

  it("rejects a non-allowlisted URL", () => {
    expect(DocumentationValidator.validateSourceUrl("https://example.com/fake-docs").accepted).toBe(false);
  });
});

describe("DocumentationValidator.validateQuestionAgainstTopic", () => {
  it("holds a question at NEEDS_REVIEW when its topic has no confirmed source", () => {
    const result = DocumentationValidator.validateQuestionAgainstTopic(baseInput, { hasVerifiedSource: false });
    expect(result.status).toBe(ValidationStatus.NEEDS_REVIEW);
    expect(result.isAutomated).toBe(true);
  });

  it("promotes to VERIFIED when the topic has a confirmed source and import confidence is high", () => {
    const result = DocumentationValidator.validateQuestionAgainstTopic(baseInput, {
      hasVerifiedSource: true,
      sourceTitle: "Coalesce a field",
      sourceUrl: "https://www.servicenow.com/docs/x.html",
    });
    expect(result.status).toBe(ValidationStatus.VERIFIED);
  });

  it("does NOT verify a question with low import-match confidence even if the topic is verified", () => {
    const result = DocumentationValidator.validateQuestionAgainstTopic(
      { ...baseInput, importMatchConfidence: 0.4 },
      { hasVerifiedSource: true, sourceTitle: "x", sourceUrl: "https://www.servicenow.com/docs/x.html" },
    );
    expect(result.status).toBe(ValidationStatus.NEEDS_REVIEW);
  });

  it("flags a source conflict as NEEDS_REVIEW rather than silently picking a side", () => {
    const result = DocumentationValidator.validateQuestionAgainstTopic(baseInput, {
      hasVerifiedSource: true,
      hasConflict: true,
      sourceTitle: "x",
      sourceUrl: "https://www.servicenow.com/docs/x.html",
    });
    expect(result.status).toBe(ValidationStatus.NEEDS_REVIEW);
    expect(result.notes).toMatch(/SOURCE CONFLICT/);
  });
});

describe("DocumentationValidator.isStale", () => {
  it("treats never-validated content as stale", () => {
    expect(DocumentationValidator.isStale(null)).toBe(true);
  });

  it("treats content validated today as fresh", () => {
    expect(DocumentationValidator.isStale(new Date())).toBe(false);
  });

  it("treats content validated 200 days ago as stale (>180 day threshold)", () => {
    const old = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000);
    expect(DocumentationValidator.isStale(old)).toBe(true);
  });
});
