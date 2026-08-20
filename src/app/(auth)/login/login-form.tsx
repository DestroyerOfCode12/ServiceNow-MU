"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OAuthButtons, type OAuthProvidersEnabled } from "@/components/oauth-buttons";

// NextAuth redirects back here with `?error=<code>` when an OAuth sign-in
// fails server-side (wrong callback URL registered on the provider, an
// email already tied to a different unlinked account, the user cancelling
// on the provider's consent screen, etc.) — a full-page redirect, so it
// can't be caught client-side the way the credentials form's own submit
// handler catches its errors. Without this, that failure was silently
// invisible: the user just lands back on a blank login form.
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: "That email is already used by a different sign-in method. Try signing in with your original method.",
  OAuthSignin: "Couldn't start the sign-in with that provider. Please try again.",
  OAuthCallback: "Something went wrong completing sign-in with that provider. Please try again.",
  AccessDenied: "Sign-in was cancelled or denied.",
};

function LoginForm({ oauthProviders }: { oauthProviders: OAuthProvidersEnabled }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const oauthErrorCode = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    oauthErrorCode ? (OAUTH_ERROR_MESSAGES[oauthErrorCode] ?? "Sign-in failed. Please try again.") : null,
  );
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
          <p className="text-sm text-foreground-muted">Continue your CSA preparation.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Field label="Email" id="email">
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Password" id="password">
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </Field>
            {error && (
              <p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <OAuthButtons providers={oauthProviders} callbackUrl={callbackUrl} />
          <p className="mt-4 text-center text-sm text-foreground-muted">
            No account?{" "}
            <Link href="/register" className="font-medium text-accent hover:underline">
              Create one
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

export function LoginFormWithSuspense({ oauthProviders }: { oauthProviders: OAuthProvidersEnabled }) {
  return (
    <Suspense>
      <LoginForm oauthProviders={oauthProviders} />
    </Suspense>
  );
}
