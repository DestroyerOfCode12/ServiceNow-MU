import { describe, it, expect } from "vitest";
import { distributeQuestions, rebalanceForAvailability } from "./distribution";

const CSA_DOMAINS = [
  { id: "D1", weightPercent: 7 },
  { id: "D2", weightPercent: 10 },
  { id: "D3", weightPercent: 20 },
  { id: "D4", weightPercent: 20 },
  { id: "D5", weightPercent: 30 },
  { id: "D6", weightPercent: 13 },
];

describe("distributeQuestions (largest-remainder apportionment)", () => {
  it("always sums to exactly the requested total, for the real CSA blueprint weights at 60 questions", () => {
    const result = distributeQuestions(CSA_DOMAINS, 60);
    const total = result.reduce((s, r) => s + r.slots, 0);
    expect(total).toBe(60);
  });

  it("stays close to each domain's exact share", () => {
    const result = distributeQuestions(CSA_DOMAINS, 60);
    const byId = Object.fromEntries(result.map((r) => [r.id, r.slots]));
    // 7% of 60 = 4.2 -> 4; 30% of 60 = 18 exactly; 20% of 60 = 12 exactly
    expect(byId.D1).toBe(4);
    expect(byId.D5).toBe(18);
    expect(byId.D3).toBe(12);
    expect(byId.D4).toBe(12);
  });

  it("sums to the total for an arbitrary odd total that forces rounding", () => {
    for (const total of [1, 7, 13, 37, 60, 100]) {
      const result = distributeQuestions(CSA_DOMAINS, total);
      expect(result.reduce((s, r) => s + r.slots, 0)).toBe(total);
    }
  });

  it("handles a single domain by giving it everything", () => {
    const result = distributeQuestions([{ id: "only", weightPercent: 100 }], 25);
    expect(result).toEqual([{ id: "only", slots: 25 }]);
  });

  it("returns an empty array for zero questions", () => {
    expect(distributeQuestions(CSA_DOMAINS, 0)).toEqual([]);
  });

  it("is deterministic for equal weights and ties (no randomness)", () => {
    const equalWeights = [
      { id: "a", weightPercent: 25 },
      { id: "b", weightPercent: 25 },
      { id: "c", weightPercent: 25 },
      { id: "d", weightPercent: 25 },
    ];
    const runs = Array.from({ length: 5 }, () => distributeQuestions(equalWeights, 10));
    for (const run of runs) expect(run).toEqual(runs[0]);
  });
});

describe("rebalanceForAvailability", () => {
  it("caps a domain at its available question count and redistributes the shortfall", () => {
    const target = distributeQuestions(CSA_DOMAINS, 60); // D1 wants 4
    const available = new Map(CSA_DOMAINS.map((d) => [d.id, 100]));
    available.set("D1", 1); // only 1 question actually exists for D1

    const result = rebalanceForAvailability(target, available, CSA_DOMAINS);
    const total = result.reduce((s, r) => s + r.slots, 0);

    expect(result.find((r) => r.id === "D1")?.slots).toBe(1);
    expect(total).toBe(60); // shortfall absorbed elsewhere since other domains have headroom
  });

  it("never exceeds a domain's available count", () => {
    const target = distributeQuestions(CSA_DOMAINS, 60);
    const available = new Map(CSA_DOMAINS.map((d) => [d.id, 2]));
    const result = rebalanceForAvailability(target, available, CSA_DOMAINS);
    for (const r of result) expect(r.slots).toBeLessThanOrEqual(2);
  });

  it("returns fewer than the target total when the whole pool is insufficient", () => {
    const target = distributeQuestions(CSA_DOMAINS, 60);
    const available = new Map(CSA_DOMAINS.map((d) => [d.id, 1]));
    const result = rebalanceForAvailability(target, available, CSA_DOMAINS);
    const total = result.reduce((s, r) => s + r.slots, 0);
    expect(total).toBe(6); // 1 per domain, 6 domains
  });
});
