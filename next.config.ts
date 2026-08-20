import type { NextConfig } from "next";

// Deliberately pragmatic, not maximal: this app has no external scripts, no
// analytics, no CDN-hosted fonts (next/font self-hosts Geist at build time),
// and no iframes — so most CSP directives can be locked to 'self'. The two
// exceptions: 'unsafe-inline' on script-src (Next.js App Router streams RSC
// payloads via inline <script>self.__next_f.push(...)</script> tags with no
// nonce wired up here — a nonce-based CSP is the stricter follow-up, see the
// audit report) and img-src allowing any https origin (OAuth avatar photos
// come from whichever host GitHub/Google/Microsoft happen to serve them
// from, e.g. avatars.githubusercontent.com, lh3.googleusercontent.com).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  // Netlify/Next already add Strict-Transport-Security and
  // X-Content-Type-Options; the ones below aren't set anywhere yet.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  agentRules: false,
  // Stops the app from advertising "X-Powered-By: Next.js" on every
  // response — a harmless-but-free bit of framework fingerprinting to give
  // away.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
