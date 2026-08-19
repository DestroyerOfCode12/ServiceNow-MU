"use client";

import { useEffect } from "react";
import { Card, CardBody } from "@/components/ui/card";
import { Button, LinkButton } from "@/components/ui/button";

/**
 * Root error boundary — catches otherwise-unhandled render/render-time
 * errors anywhere in the app and shows a recoverable, branded screen
 * instead of Next.js's default error overlay (which in production is just
 * a bare "Something went wrong" with no way back into the app).
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Server-side log only; nothing sent to a third party. Kept minimal —
    // the digest is what actually helps correlate this to a server log line.
    console.error("Unhandled client error:", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <Card className="max-w-md text-center">
        <CardBody className="py-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-danger">Something went wrong</p>
          <h1 className="mt-2 text-2xl font-bold text-foreground">This page hit an unexpected error</h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Nothing you did caused this — try again, or head back to the dashboard. If it keeps happening, let us know
            what you were doing.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={() => reset()}>Try again</Button>
            <LinkButton href="/dashboard" variant="secondary">
              Go to dashboard
            </LinkButton>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
