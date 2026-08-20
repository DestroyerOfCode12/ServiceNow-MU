import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import type { NextAuthRequest } from "next-auth";
import { authConfig } from "@/auth.config";

// A separate, lightweight NextAuth instance built from just the edge-safe
// authConfig (no Prisma adapter, no Credentials/bcrypt, no OAuth secrets) —
// NOT the full `auth` export from `@/auth`. Netlify runs Next.js Middleware
// as a Deno-based Edge Function that cannot bundle Prisma's native
// query-engine binary; importing the full `@/auth` here (even transitively)
// pulls that binary in and breaks the build with "Usage of unsupported C++
// Addon(s) found in Node.js Middleware". This instance only ever decodes an
// existing session JWT (pure signature verification, no DB access), which is
// all middleware needs.
const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/practice", "/exams", "/progress", "/bookmarks", "/notes", "/admin", "/search"];
const ADMIN_PREFIXES = ["/admin"];

// Named `proxy` per Next.js 16's renamed convention (formerly `middleware`) —
// recommended even when exported via `auth(...)`'s default-export wrapper,
// since the underlying request handler is what the convention is about.
function proxy(req: NextAuthRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  if (!req.auth?.user) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const isAdminRoute = ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdminRoute && req.auth.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export default auth(proxy);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/practice/:path*",
    "/exams/:path*",
    "/progress/:path*",
    "/bookmarks/:path*",
    "/notes/:path*",
    "/admin/:path*",
    "/search/:path*",
  ],
};
