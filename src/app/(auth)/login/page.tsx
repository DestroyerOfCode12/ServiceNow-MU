import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { OAUTH_PROVIDERS_ENABLED } from "@/auth";
import { LoginFormWithSuspense } from "./login-form";

// Server component wrapper so an already-authenticated visitor gets a real
// server-side redirect before any markup renders — no flash of the login
// form followed by a client-side bounce. The interactive form itself has to
// stay a client component (useState/signIn), so it's split into a sibling.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const user = await getCurrentUser();
  if (user) {
    // Honor callbackUrl here too, same as a successful sign-in would — an
    // already-authenticated visitor who followed a login link from some
    // protected page should land back there, not always at /dashboard.
    const { callbackUrl } = await searchParams;
    redirect(callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard");
  }

  return <LoginFormWithSuspense oauthProviders={OAUTH_PROVIDERS_ENABLED} />;
}
