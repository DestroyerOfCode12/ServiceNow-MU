import { describe, it, expect } from "vitest";
import { estimateDifficulty } from "./difficulty-heuristic";
import { Difficulty, QuestionType } from "@prisma/client";

describe("estimateDifficulty", () => {
  it("rates a short, factual single-choice question as easy", () => {
    const d = estimateDifficulty({ questionText: "Which language is primarily used in ServiceNow?", questionType: QuestionType.SINGLE_CHOICE });
    expect(d).toBe(Difficulty.EASY);
  });

  it("rates a multiple-select question at least medium", () => {
    const d = estimateDifficulty({ questionText: "Pick two.", questionType: QuestionType.MULTIPLE_SELECT });
    expect([Difficulty.MEDIUM, Difficulty.HARD]).toContain(d);
  });

  it("rates a long scenario question as hard", () => {
    const longScenario =
      "An administrator needs a field to become mandatory only when the State is set to Resolved, and the behavior must occur immediately while the user is working on the form. Which configuration should be used?";
    const d = estimateDifficulty({ questionText: longScenario, questionType: QuestionType.MULTIPLE_SELECT });
    expect(d).toBe(Difficulty.HARD);
  });
});
