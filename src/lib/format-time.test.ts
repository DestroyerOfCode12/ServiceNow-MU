import { describe, it, expect } from "vitest";
import { formatTime } from "./format-time";

describe("formatTime", () => {
  it("formats under an hour as MM:SS", () => {
    expect(formatTime(0)).toBe("00:00");
    expect(formatTime(59)).toBe("00:59");
    expect(formatTime(90)).toBe("01:30");
    expect(formatTime(3599)).toBe("59:59");
  });

  it("formats exactly the 90-minute exam duration", () => {
    expect(formatTime(90 * 60)).toBe("01:30:00");
  });

  it("formats an hour or more as HH:MM:SS", () => {
    expect(formatTime(3661)).toBe("01:01:01");
  });

  it("clamps negative time to zero", () => {
    expect(formatTime(-5)).toBe("00:00");
  });
});
