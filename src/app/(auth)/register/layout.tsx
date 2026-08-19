import type { Metadata } from "next";

// See login/layout.tsx — same reasoning: the page itself is a client
// component, so its title has to come from a segment-scoped server layout.
export const metadata: Metadata = { title: "Create Account · CSA Prep Platform" };

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
