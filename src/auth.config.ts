import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the Auth.js config — no Prisma adapter, no Credentials
 * provider (bcrypt is a native Node addon too), no OAuth provider secrets.
 * proxy.ts (Next.js Middleware, which Netlify runs as a Deno-based Edge
 * Function) constructs its own lightweight `NextAuth(authConfig)` instance
 * from just this file, so Prisma's native query-engine binary never gets
 * bundled into that runtime — the actual error this file exists to fix:
 * "Usage of unsupported C++ Addon(s) found in Node.js Middleware".
 *
 * Middleware only ever needs to *decode* an existing session JWT to read
 * `req.auth.user` (pure signature verification against AUTH_SECRET, no DB
 * involved) — it never runs a provider's authorize()/OAuth flow itself,
 * which is why `providers: []` here is correct and sufficient. auth.ts (the
 * full config, Node-runtime only) spreads this and adds the real providers,
 * adapter, and events for everywhere else: API routes and Server Components.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    },
  },
};
