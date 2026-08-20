import { timingSafeEqual } from "crypto";

/**
 * Constant-time comparison for bearer tokens (SEED_TOKEN). A plain `!==`
 * comparison short-circuits on the first mismatched byte, which in theory
 * leaks how many leading characters of a guess were correct via response
 * timing. SEED_TOKEN is high-entropy (48 random hex chars) so this isn't a
 * practical attack here, but a constant-time compare costs nothing and is
 * the standard way to compare secrets.
 */
export function safeTokenEquals(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch rather than returning false —
  // guard it explicitly. Comparing against a fixed-length buffer first would
  // itself leak length via timing, but leaking the *length* of a token (not
  // its content) is a far smaller concern than leaking which prefix bytes
  // matched, and is unavoidable without padding to a fixed size.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
