import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";
import { auth } from "@/auth";

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
