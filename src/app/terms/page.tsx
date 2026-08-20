import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that apply to using CSA Prep Platform's practice exams and study content.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "2026-08-20";

export default function TermsPage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-foreground-muted">Last updated: {LAST_UPDATED}</p>

      <Card className="mt-6 border-accent/40 bg-accent/5">
        <CardBody>
          <p className="text-sm text-foreground">
            <strong>This document is provided for transparency and is not a substitute for legal advice.</strong> The
            operator of this site should have this reviewed by a qualified professional before relying on it.
          </p>
        </CardBody>
      </Card>

      <div className="mt-8 space-y-8 text-sm leading-6 text-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. What this platform is</h2>
          <p className="mt-2">
            CSA Prep Platform (&ldquo;the platform&rdquo;, &ldquo;we&rdquo;) is an independent, unofficial study and
            practice-exam tool for candidates preparing for ServiceNow&apos;s Certified System Administrator (CSA)
            exam. It is operated by Jacob Essel Mkhwanazi, an individual (not a registered company).
          </p>
          <p className="mt-2">
            <strong>We are not affiliated with, endorsed by, or sponsored by ServiceNow, Inc.</strong>{" "}
            &ldquo;ServiceNow&rdquo; and &ldquo;Certified System Administrator&rdquo; are trademarks of ServiceNow,
            Inc. Nothing on this platform is official ServiceNow certification material.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Content integrity</h2>
          <p className="mt-2">
            Every practice question on this platform is original, written from publicly available ServiceNow
            documentation and learning material. The platform does not use, and will never use, leaked exam content,
            exam dumps, or confidential ServiceNow certification questions.
          </p>
          <p className="mt-2">
            Practice scores are an internal readiness indicator only. ServiceNow does not publish its official CSA
            exam cut score, so the platform never claims a &ldquo;pass&rdquo; or &ldquo;fail&rdquo; result, and a
            practice score is not a guarantee of your result on the actual exam.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Your account</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>You must provide accurate information when registering and keep your credentials confidential.</li>
            <li>You&apos;re responsible for activity that happens under your account.</li>
            <li>One account per person — don&apos;t share login credentials.</li>
            <li>
              We may suspend or terminate an account that we reasonably believe is being used to abuse the platform
              (e.g. scraping the question bank, attempting to bypass access controls, or automated/bot usage).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Acceptable use</h2>
          <p className="mt-2">You agree not to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Copy, scrape, redistribute, or resell the question bank or study content.</li>
            <li>Attempt to access another user&apos;s account, data, or exam attempts.</li>
            <li>Probe, scan, or attempt to bypass the platform&apos;s security or access controls.</li>
            <li>Use the platform to develop a competing product from its content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. No warranty</h2>
          <p className="mt-2">
            The platform is provided &ldquo;as is&rdquo;, without warranty of any kind. We work to keep content
            accurate — every question and topic carries a visible validation status — but we don&apos;t guarantee the
            platform is error-free, uninterrupted, or that using it will result in passing the actual ServiceNow CSA
            exam.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. Limitation of liability</h2>
          <p className="mt-2">
            To the maximum extent permitted by South African law, the operator is not liable for indirect, incidental,
            or consequential damages arising from your use of, or inability to use, the platform — including exam
            results.{" "}
            <span className="font-mono text-danger">
              [CONFIRM: South Africa&apos;s Consumer Protection Act restricts what liability a business can exclude
              toward a consumer — whether, and how, that applies here should be reviewed by a South African lawyer
              before this clause is relied on]
            </span>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Pricing</h2>
          <p className="mt-2">
            The platform is free to use. There is no payment or subscription required for any current feature. We
            may, in the future, offer an optional way to support the platform with a voluntary donation — a donation
            is not a purchase, carries no additional entitlement or guarantee beyond what&apos;s already free, and no
            such mechanism exists on the platform today. If that changes, this section will be updated with the
            actual terms before it launches, not after.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Governing law</h2>
          <p className="mt-2">
            These terms are governed by the laws of the Republic of South Africa, without regard to its conflict-of-
            laws principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Changes to these terms</h2>
          <p className="mt-2">
            If these terms change materially, we&apos;ll update the &ldquo;Last updated&rdquo; date above. Continued
            use of the platform after a change means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
          <p className="mt-2">
            Questions about these terms:{" "}
            <a href="mailto:jacobesselmkhwanazi@gmail.com" className="text-accent hover:underline">
              jacobesselmkhwanazi@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
