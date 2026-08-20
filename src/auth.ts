import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/auth";
import { authConfig } from "./auth.config";

/**
 * Each OAuth provider is opt-in: only registered when its env vars are
 * actually set, so a deployment that hasn't configured GitHub/Google/
 * Microsoft yet keeps working exactly as before (email/password only), and
 * the login page (via OAUTH_PROVIDERS_ENABLED below) only ever renders a
 * button for a provider that will actually work if clicked.
 */
const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      // No passwordHash means this account was created via OAuth only —
      // there is nothing to compare against, so credentials login must fail
      // rather than throw (bcrypt.compare requires a string).
      if (!user || !user.passwordHash) return null;

      const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!valid) return null;

      return { id: user.id, email: user.email, name: user.name, role: user.role };
    },
  }),
];

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // GitHub/Google/Microsoft all verify email ownership before including
      // it in the OAuth profile, so trusting that to link to an existing
      // password-based account with the same email is the standard, sound
      // use of this flag (see Auth.js's Security FAQ on account linking).
      allowDangerousEmailAccountLinking: true,
    }),
  );
}
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}
if (process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET) {
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      // Omitted -> defaults to the "common" tenant, i.e. any Microsoft
      // account (personal, school, or work) can sign in. Set this env var
      // to a specific tenant ID's issuer URL to restrict to one org instead.
      issuer: process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

/** Which OAuth buttons the login/register UI should actually render. */
export const OAUTH_PROVIDERS_ENABLED = {
  github: !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
  google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  microsoftEntraId: !!(process.env.AUTH_MICROSOFT_ENTRA_ID_ID && process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET),
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Spreads in the edge-safe pages/callbacks from auth.config.ts (shared
  // with proxy.ts's lightweight instance) and adds everything that needs
  // the Node runtime: the adapter, bcrypt-based Credentials provider, and
  // the OAuth providers' client secrets.
  ...authConfig,
  // Persists OAuth Account rows (and creates a User row for a first-time
  // OAuth sign-in) even though sessions themselves stay JWT-based below —
  // Credentials provider requires JWT sessions, but an adapter can still be
  // present purely for account/profile persistence. This is the officially
  // supported "hybrid" setup for mixing Credentials with OAuth providers.
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  events: {
    // The adapter creates the User row for a first-time OAuth sign-in, but
    // it has no idea about Profile (our own app-specific extension, not
    // part of Auth.js's schema) — without this, an OAuth-created account
    // would never get the streak-tracking row that /register's API route
    // creates explicitly for credentials sign-ups. Runs exactly once, only
    // for a genuinely new user (not on every sign-in).
    async createUser({ user }) {
      if (user.id) {
        await prisma.profile.create({ data: { userId: user.id } }).catch(() => {
          // Extremely unlikely race (e.g. two concurrent first-time OAuth
          // sign-ins) — the unique userId constraint would reject a second
          // insert. Nothing to recover: the first one already succeeded.
        });
      }
    },
  },
  // jwt/session callbacks come from the ...authConfig spread above — no
  // Prisma/bcrypt involved in either, so they're identical whether the
  // token is minted here (full config) or just decoded in proxy.ts's
  // lightweight edge instance.
});
