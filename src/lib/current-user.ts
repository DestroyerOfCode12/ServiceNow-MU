import { auth } from "@/auth";

/** Server-side helper: returns the current session user, or null. */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Throws-free guard for API routes: returns user or a 401 payload marker. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: { status: 401 as const, message: "Authentication required." } };
  return { user, error: null };
}

export async function requireAdmin() {
  const { user, error } = await requireUser();
  if (error) return { user: null, error };
  if (user!.role !== "ADMIN") {
    return { user: null, error: { status: 403 as const, message: "Admin access required." } };
  }
  return { user, error: null };
}
