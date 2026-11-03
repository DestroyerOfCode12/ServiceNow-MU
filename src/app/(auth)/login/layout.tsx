import type { Metadata } from "next";

// The login page itself is a client component (useState/useSession), and
// Next.js only allows a `metadata` export from a server component — this
// segment-scoped layout is the idiomatic way to give a client page its own
// browser tab title without converting it away from "use client".
export const metadata: Metadata = {
  // Root layout's title template already appends "· CSA Prep Platform" —
  // repeating it here would double it up in the rendered <title>.
  title: "Sign In",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
