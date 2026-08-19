import { describe, it, expect } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  it("allows requests up to the limit, then blocks", () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit(key, { limit: 3, windowMs: 60_000 }).allowed).toBe(true);
    }
    expect(rateLimit(key, { limit: 3, windowMs: 60_000 }).allowed).toBe(false);
  });

  it("tracks separate keys independently", () => {
    const a = `a-${Math.random()}`;
    const b = `b-${Math.random()}`;
    rateLimit(a, { limit: 1, windowMs: 60_000 });
    expect(rateLimit(a, { limit: 1, windowMs: 60_000 }).allowed).toBe(false);
    expect(rateLimit(b, { limit: 1, windowMs: 60_000 }).allowed).toBe(true);
  });
});
