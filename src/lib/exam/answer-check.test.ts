import { describe, it, expect } from "vitest";
import { isAnswerCorrect } from "./answer-check";

describe("isAnswerCorrect (no partial credit)", () => {
  it("single_choice: correct when the one selected option matches", () => {
    expect(isAnswerCorrect(["a"], ["a"])).toBe(true);
  });

  it("single_choice: incorrect when the wrong option is selected", () => {
    expect(isAnswerCorrect(["a"], ["b"])).toBe(false);
  });

  it("unanswered (empty selection) is never correct", () => {
    expect(isAnswerCorrect(["a"], [])).toBe(false);
    expect(isAnswerCorrect([], [])).toBe(false);
  });

  it("multiple_select: correct only when the selected set exactly equals the correct set", () => {
    expect(isAnswerCorrect(["a", "b"], ["b", "a"])).toBe(true); // order doesn't matter
  });

  it("multiple_select: missing a correct option is wrong (no partial credit)", () => {
    expect(isAnswerCorrect(["a", "b"], ["a"])).toBe(false);
  });

  it("multiple_select: an extra, incorrect option is wrong (no partial credit)", () => {
    expect(isAnswerCorrect(["a", "b"], ["a", "b", "c"])).toBe(false);
  });

  it("multiple_select: selecting the wrong options entirely is wrong", () => {
    expect(isAnswerCorrect(["a", "b"], ["c", "d"])).toBe(false);
  });
});
