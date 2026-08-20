import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal information CSA Prep Platform collects, why, how it's stored, and your rights over it.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "2026-08-20";

export default function PrivacyPage() {
  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-foreground-muted">Last updated: {LAST_UPDATED}</p>

      <Card className="mt-6 border-accent/40 bg-accent/5">
        <CardBody>
          <p className="text-sm text-foreground">
            <strong>This policy is provided for transparency and is not a substitute for legal advice.</strong> The
            operator of this site should have this reviewed by a qualified professional for the jurisdictions its
            users are actually in before relying on it as a compliance document.
          </p>
        </CardBody>
      </Card>

      <div className="mt-8 space-y-8 text-sm leading-6 text-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Who operates this site</h2>
          <p className="mt-2">
            CSA Prep Platform is operated by Jacob Essel Mkhwanazi, an individual (not a registered company). For any
            privacy question, correction, deletion, or access request, contact{" "}
            <a href="mailto:jacobesselmkhwanazi@gmail.com" className="text-accent hover:underline">
              jacobesselmkhwanazi@gmail.com
            </a>
            .
          </p>
          <p className="mt-2 text-foreground-muted">
            This site is not affiliated with, endorsed by, or sponsored by ServiceNow, Inc.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">2. What we collect</h2>
          <p className="mt-2">When you create an account, we collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Your email address and, if you provide one, your display name.</li>
            <li>
              A one-way hashed password (if you register with email/password) — we never store your password itself,
              only a bcrypt hash of it that cannot be reversed.
            </li>
            <li>
              If you sign in with GitHub, Google, or Microsoft instead: the name, email address, and profile picture
              your account made public to that provider, and nothing else from it. We never see or store your
              password for those providers.
            </li>
          </ul>
          <p className="mt-3">As you use the platform, we store, tied to your account:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Practice and exam attempts, your answers, timing, and resulting scores.</li>
            <li>Notes and bookmarks you create.</li>
            <li>Flashcard review history and topic/domain progress statistics.</li>
            <li>Achievement unlocks and study streak data.</li>
          </ul>
          <p className="mt-3">
            We do not collect payment information, phone numbers, physical addresses, or government ID numbers — the
            platform doesn&apos;t use any of them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Why we collect it</h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Email/password (or an OAuth sign-in) — to authenticate you and keep your account secure.</li>
            <li>
              Attempts, answers, notes, bookmarks, and progress data — this is the product: study history,
              weak-area detection, and readiness scoring only work by remembering what you&apos;ve practiced.
            </li>
          </ul>
          <p className="mt-2">
            We do not use your data for advertising, do not sell it, and do not share it with data brokers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Cookies &amp; similar technologies</h2>
          <p className="mt-2">
            This site currently sets only <strong>strictly necessary</strong> cookies — the kind that are exempt
            from consent requirements under most privacy laws (including POPIA and the GDPR) because the site can&apos;t
            function without them:
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border text-foreground-muted">
                  <th className="py-2 pr-4">Cookie</th>
                  <th className="py-2 pr-4">Purpose</th>
                  <th className="py-2">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2 pr-4 font-mono">authjs.session-token</td>
                  <td className="py-2 pr-4">Keeps you signed in.</td>
                  <td className="py-2">30 days</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono">authjs.csrf-token</td>
                  <td className="py-2 pr-4">Protects sign-in forms from cross-site request forgery.</td>
                  <td className="py-2">Session</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono">authjs.callback-url</td>
                  <td className="py-2 pr-4">Remembers where to send you back to after signing in.</td>
                  <td className="py-2">Session</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3">
            We do not currently use analytics cookies, advertising cookies, or any third-party tracking technology.
            If that changes, this section and the consent mechanism on the site will be updated before it happens —
            not after.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Who your data is shared with</h2>
          <p className="mt-2">We use a small number of infrastructure providers to run this site:</p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>
              <strong>Netlify</strong> — hosting, and the managed PostgreSQL database your account data is stored in.
            </li>
            <li>
              <strong>GitHub, Google, or Microsoft</strong> — only if you choose to sign in with one of them; they
              act as an identity provider for that sign-in, nothing more.
            </li>
          </ul>
          <p className="mt-2">
            <span className="font-mono text-danger">
              [CONFIRM: any additional processors — email delivery, error monitoring, analytics — should be listed
              here before they&apos;re added to the site]
            </span>
          </p>
          <p className="mt-2">We do not sell your personal information to anyone, for any reason.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">6. How long we keep your data</h2>
          <p className="mt-2">
            We retain your account and study data for as long as your account exists. There is currently no
            automatic account-deletion or data-expiry mechanism — deletion is handled on request (see below).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Your rights</h2>
          <p className="mt-2">
            Depending on where you&apos;re located, you may have rights to access, correct, or delete your personal
            information, object to or restrict certain processing, and request a copy of your data in a portable
            format (for example, under South Africa&apos;s POPIA, or the EU/UK GDPR if applicable to you).
          </p>
          <p className="mt-2">
            To exercise any of these rights, email{" "}
            <a href="mailto:jacobesselmkhwanazi@gmail.com" className="text-accent hover:underline">
              jacobesselmkhwanazi@gmail.com
            </a>
            . Account deletion is currently handled manually on request rather than through a self-service control
            in the product — we aim to action requests within a reasonable time.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Security</h2>
          <p className="mt-2">
            Passwords are hashed with bcrypt and never stored or logged in plain text. Connections to the site are
            encrypted (HTTPS). Access to practice/exam data is scoped to your own account — no other user, including
            other candidates, can see your attempts, notes, or bookmarks. Administrative functions are restricted to
            accounts explicitly granted an admin role.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Children&apos;s privacy</h2>
          <p className="mt-2">
            This platform is intended for adults and working professionals preparing for a ServiceNow certification
            exam. It is not directed at children, and we do not knowingly collect personal information from
            children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Changes to this policy</h2>
          <p className="mt-2">
            If this policy changes materially, we&apos;ll update the &ldquo;Last updated&rdquo; date above. Continued
            use of the platform after a change means you accept the updated policy.
          </p>
        </section>
      </div>
    </div>
  );
}
