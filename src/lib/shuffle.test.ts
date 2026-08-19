import { describe, it, expect } from "vitest";
import { shuffle } from "./shuffle";

describe("shuffle", () => {
  it("returns a permutation of the same elements (randomizes order, not meaning)", () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
    expect([...result].sort()).toEqual([...input].sort());
  });

  it("does not mutate the input array", () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it("eventually produces a different order across many runs (not a no-op)", () => {
    const input = Array.from({ length: 20 }, (_, i) => i);
    const results = new Set<string>();
    for (let i = 0; i < 30; i++) results.add(shuffle(input).join(","));
    expect(results.size).toBeGreaterThan(1);
  });
});
