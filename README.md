# CSA Prep Platform

An independent, unofficial exam-preparation platform for the ServiceNow Certified
System Administrator (CSA) certification. **Not affiliated with, endorsed by, or
sponsored by ServiceNow, Inc.**

Full 60-question / 90-minute simulated exams, topic-based study content, flashcards,
weak-area detection, a practice readiness score, and an admin content-validation
workflow that checks questions against real, fetched official ServiceNow
documentation rather than trusting the source study guide blindly.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- PostgreSQL + Prisma ORM
- Auth.js (NextAuth v5), credentials + bcrypt
- Zod validation, Recharts, Vitest

## Getting started

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL / AUTH_SECRET
npx prisma migrate dev
npm run db:seed
npm run dev
```

Seeding creates:
- An **admin** account from `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` in `.env`
  (defaults to `admin@example.com` / `ChangeMe123!` if unset).
- A **demo** account: `demo@example.com` / `Demo1234!`.
- The current CSA blueprint (6 domains, versioned in `blueprint_versions`), 26
  canonical topics with study content, ~23 flashcards, and 139 practice
  questions (120 imported from the supplied study guide + 19 originally
  authored to cover Domain 1/2, which the source study guide barely touched).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm test` | Vitest — unit tests always run; DB integration tests run automatically when `DATABASE_URL` is set, and are skipped otherwise |
| `npm run db:seed` | Re-run the seed (see note below on re-running) |
| `npm run db:audit` | Regenerate `content-audit-report.md` — the full validation-status breakdown over every question |
| `npm run db:studio` | Prisma Studio |

`prisma/seed.ts` is not idempotent against question rows (it always inserts) —
run it once against a fresh database (`npx prisma migrate reset` will ask for
confirmation since it's destructive, or just start from an empty DB).

## Content pipeline & validation, in brief

1. `prisma/seed-data/imported-questions.raw.json` — the 120 study-guide
   questions, parsed straight from the supplied `.docx` (see
   `prisma/seed-data/*.raw.json` provenance comment at the top of `seed.ts`).
2. `src/lib/import/topic-mapper.ts` maps each question onto the **current**
   CSA blueprint's topic taxonomy by keyword, falling back to the study
   guide's own topic bucket only when no keyword matches — the two taxonomies
   are deliberately not assumed to line up.
3. `src/lib/validation/documentation-validator.ts` is the validation engine.
   A topic is only ever marked `VERIFIED` after a real, fetched, allow-listed
   ServiceNow source is on file for it (`src/lib/validation/source-allowlist.ts`
   — servicenow.com, docs.servicenow.com, developer.servicenow.com,
   nowlearning/learning.servicenow.com, support.servicenow.com only). A
   question then inherits `VERIFIED` only when its own topic is verified *and*
   the import matched its answer text with high confidence — every other
   question sits at `NEEDS_REVIEW` until an admin (or a future validation
   pass) looks at it. Nothing is auto-verified without a citation.
4. `src/lib/validation/quality-score.ts` turns that into a 0-100 quality score
   that gates full-exam eligibility (`>= 80`) — a verified question with no
   explanation on file still won't qualify.
5. `/admin/validation` is the resulting review queue; `/admin/questions/[id]`
   is the full editor with version history and an audit trail.

Run `npm run db:audit` any time for the current numbers — see
`content-audit-report.md` for the latest snapshot committed alongside this
repo.

## Known content gaps (honest, by design)

- 65 of 139 questions (mostly from the original study guide) don't carry an
  explanation yet and are held below the exam-eligible quality threshold as a
  result — they're fully usable in Practice modes, just not selected into a
  Full CSA Exam. `/admin/questions?status=NEEDS_REVIEW` is where to fix that.
- Domains 3 and 4 (Configuring Applications for Collaboration; Self Service
  and Automation) currently have fewer exam-eligible questions than their
  blueprint weight would ideally call for at 60 questions/attempt. The exam
  generator (`src/lib/exam/distribution.ts`) detects this and proportionally
  redistributes the shortfall to other domains so every attempt still totals
  exactly the blueprint's question count — it never silently serves an
  under-sized exam — but domain fidelity suffers slightly until more
  Domain 3/4 content is authored or validated.
- 2 of 26 topics (`personalizing-the-instance`, `data-schema`) don't yet have
  a confirmed official source on file.
