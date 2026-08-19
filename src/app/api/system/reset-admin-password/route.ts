import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

/**
 * Token-protected admin-password reset. Exists for the same reason as
 * `/api/system/seed`: no direct database network access to a deployed
 * environment's DB (e.g. Netlify DB) from outside the platform, so a
 * misconfigured/rotated ADMIN_SEED_PASSWORD can't be fixed any other way
 * without a full re-seed (which `/api/system/seed` explicitly refuses to do
 * a second time, since re-seeding would duplicate the question bank).
 */
export async function POST(req: Request) {
  const token = process.env.SEED_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "SEED_TOKEN is not configured on this deployment." }, { status: 501 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (provided !== token) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "ADMIN_SEED_PASSWORD is not configured on this deployment." }, { status: 501 });
  }

  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    return NextResponse.json({ error: `No user found for ${adminEmail}. Run /api/system/seed first.` }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.update({ where: { id: admin.id }, data: { passwordHash, role: "ADMIN" } });

  return NextResponse.json({ ok: true, email: adminEmail });
}
