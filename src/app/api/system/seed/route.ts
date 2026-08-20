import { NextResponse } from "next/server";
import { safeTokenEquals } from "@/lib/auth-token";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed/run-seed";

/**
 * One-off, token-protected bootstrap seeding endpoint for deployed
 * environments with no direct database network access from outside the
 * platform (e.g. Netlify DB) — mirrors `prisma/seed.ts` exactly via the
 * shared `runSeed` function, but callable over HTTP instead of the CLI.
 *
 * Guarded by SEED_TOKEN (a secret env var, not one an admin ever types into
 * a UI) and refuses to run twice as a deliberate operational safeguard —
 * `runSeed` itself is fully idempotent now (existence-guarded per content
 * type), but this endpoint still only exists to bootstrap a brand-new,
 * empty database, not to be re-triggered casually against a live one.
 * For adding new seed-only content (e.g. a new achievement set) to an
 * already-seeded deployment, see /api/system/seed-achievements instead —
 * a narrower, always-safe-to-re-run sibling endpoint.
 */
export async function POST(req: Request) {
  const token = process.env.SEED_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "SEED_TOKEN is not configured on this deployment." }, { status: 501 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!safeTokenEquals(provided, token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const existing = await prisma.blueprintVersion.count();
  if (existing > 0) {
    return NextResponse.json(
      { error: "This database already has seed data (a blueprint version exists). Refusing to run again to avoid duplicating questions." },
      { status: 409 },
    );
  }

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!";

  try {
    const result = await runSeed(prisma, adminEmail, adminPassword);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Seed failed." }, { status: 500 });
  }
}
