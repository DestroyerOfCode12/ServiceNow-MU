import type { Metadata } from "next";

// The login page itself is a client component (useState/useSession), and
// Next.js only allows a `metadata` export from a server component — this
// segment-scoped layout is the idiomatic way to give a client page its own
// browser tab title without converting it away from "use client".
export const metadata: Metadata = { title: "Sign In · CSA Prep Platform" };

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
