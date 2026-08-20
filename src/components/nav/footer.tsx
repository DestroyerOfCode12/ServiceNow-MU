import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="container-page flex flex-col gap-3 py-8 text-sm text-foreground-muted">
        <p className="font-medium text-foreground">CSA Prep Platform</p>
        <p className="max-w-3xl">
          This is an independent, unofficial ServiceNow CSA certification preparation platform. It is not affiliated
          with, endorsed by, or sponsored by ServiceNow, Inc. &ldquo;ServiceNow&rdquo; and &ldquo;Certified System
          Administrator&rdquo; are trademarks of ServiceNow, Inc. All practice questions are original, CSA-style
          content — none reproduce actual, confidential ServiceNow certification exam questions.
        </p>
        <p className="max-w-3xl">
          Practice scores are an internal readiness indicator only and do not represent an official ServiceNow
          pass/fail determination. ServiceNow does not publish its CSA exam cut score.
        </p>
        <nav aria-label="Legal" className="flex gap-4 pt-2">
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground hover:underline">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
