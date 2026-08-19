import { describe, it, expect } from "vitest";
import { xpForLevel, levelFromXp } from "./xp";

describe("xpForLevel", () => {
  it("requires 0 XP to be level 1", () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it("grows with the triangular curve 50 * (L-1) * L", () => {
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(xpForLevel(4)).toBe(600);
    expect(xpForLevel(5)).toBe(1000);
  });

  it("is strictly increasing — no level ever requires less XP than the one before it", () => {
    for (let l = 1; l < 30; l++) {
      expect(xpForLevel(l + 1)).toBeGreaterThan(xpForLevel(l));
    }
  });
});

describe("levelFromXp", () => {
  it("starts everyone at level 1 with 0 XP", () => {
    const info = levelFromXp(0);
    expect(info.level).toBe(1);
    expect(info.xpIntoLevel).toBe(0);
    expect(info.xpForNextLevel).toBe(100);
    expect(info.progressPercent).toBe(0);
  });

  it("stays at the current level right up to the XP boundary", () => {
    expect(levelFromXp(99).level).toBe(1);
    expect(levelFromXp(100).level).toBe(2);
  });

  it("computes progress within the current level correctly", () => {
    // Level 2 spans [100, 300) — 100 XP into it out of 200 needed = 50%.
    const info = levelFromXp(200);
    expect(info.level).toBe(2);
    expect(info.xpIntoLevel).toBe(100);
    expect(info.xpForNextLevel).toBe(200);
    expect(info.progressPercent).toBe(50);
  });

  it("round-trips consistently with xpForLevel across a range of levels", () => {
    for (let l = 1; l <= 20; l++) {
      const boundary = xpForLevel(l);
      expect(levelFromXp(boundary).level).toBe(l);
      expect(levelFromXp(boundary + 1).level).toBe(l); // still in level l, not yet l+1
    }
  });

  it("never regresses level as XP increases", () => {
    let prevLevel = 1;
    for (let xp = 0; xp <= 5000; xp += 37) {
      const level = levelFromXp(xp).level;
      expect(level).toBeGreaterThanOrEqual(prevLevel);
      prevLevel = level;
    }
  });
});
