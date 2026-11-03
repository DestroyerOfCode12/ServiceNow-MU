import type { Metadata } from "next";

// See login/layout.tsx — same reasoning: the page itself is a client
// component, so its title has to come from a segment-scoped server layout.
export const metadata: Metadata = {
  // Root layout's title template already appends "· CSA Prep Platform" —
  // repeating it here would double it up in the rendered <title>.
  title: "Create Account",
  alternates: { canonical: "/register" },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
