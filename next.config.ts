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
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // Set explicitly rather than relied on as a host default — confirmed
  // Netlify adds this automatically but Vercel doesn't, so the app now sets
  // it itself instead of depending on which platform happens to serve it.
  { key: "X-Content-Type-Options", value: "nosniff" },
];

// The old Netlify domain (no longer the maintained deployment — see README's
// Deployments section) still gets traffic from bookmarks, old links, and
// search engines. Rather than a separate netlify.toml redirect rule (which
// needs its own successful Netlify deploy to ever take effect, and Netlify
// deploys are currently blocked by an account-level credit limit unrelated
// to this app), this lives in the app itself: a host-matched redirect that
// only ever fires when a request's Host header is the Netlify domain — a
// no-op everywhere else, including on Vercel. It goes live automatically
// the next time Netlify does manage to deploy, with no separate config.
const OLD_NETLIFY_HOST = "servicenow-csa-prep.netlify.app";
const CANONICAL_ORIGIN = "https://servicenow-csa-prep-v2.vercel.app";

const nextConfig: NextConfig = {
  agentRules: false,
  // Stops the app from advertising "X-Powered-By: Next.js" on every
  // response — a harmless-but-free bit of framework fingerprinting to give
  // away.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: OLD_NETLIFY_HOST }],
        destination: `${CANONICAL_ORIGIN}/:path*`,
        // 308 (Next.js's `permanent: true`) rather than a temporary 307 —
        // this is a real domain migration, not a maintenance detour, so
        // search engines should transfer ranking signal to the new domain
        // instead of continuing to crawl/index the old one.
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
