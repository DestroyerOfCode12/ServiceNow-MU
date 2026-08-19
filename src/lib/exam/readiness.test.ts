import { describe, it, expect } from "vitest";
import { bandFor } from "./readiness";

describe("bandFor (readiness score bands)", () => {
  it("bands scores into the documented ranges", () => {
    expect(bandFor(0)).toBe("Needs focused study");
    expect(bandFor(39)).toBe("Needs focused study");
    expect(bandFor(40)).toBe("Building foundation");
    expect(bandFor(59)).toBe("Building foundation");
    expect(bandFor(60)).toBe("Developing readiness");
    expect(bandFor(74)).toBe("Developing readiness");
    expect(bandFor(75)).toBe("Strong preparation");
    expect(bandFor(89)).toBe("Strong preparation");
    expect(bandFor(90)).toBe("Exam ready");
    expect(bandFor(100)).toBe("Exam ready");
  });
});
