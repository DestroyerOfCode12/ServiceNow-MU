import { PrismaClient, ValidationStatus, QuestionType, ContentAuditAction, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BLUEPRINT_VERSION, DOMAINS } from "../../../prisma/seed-data/blueprint";
import { TOPIC_CONTENT } from "../../../prisma/seed-data/topic-content";
import { TOPIC_SOURCES } from "../../../prisma/seed-data/topic-sources";
import { FLASHCARDS } from "../../../prisma/seed-data/flashcards";
import { SUPPLEMENTAL_QUESTIONS } from "../../../prisma/seed-data/supplemental-questions";
import rawImportedQuestions from "../../../prisma/seed-data/imported-questions.raw.json";
import { mapQuestionToTopicSlug } from "../import/topic-mapper";
import { estimateDifficulty } from "../import/difficulty-heuristic";
import { computeQualityScore, EXAM_ELIGIBLE_THRESHOLD, EXAM_PREFERRED_THRESHOLD } from "../validation/quality-score";
import { DocumentationValidator } from "../validation/documentation-validator";

interface RawImportedQuestion {
  number: number;
  question_text: string;
  choose_n: number | null;
  options: string[];
  correct_raw: string;
  explanation_lines: string[];
  correct_options: string[];
  _match_confidence: number;
  study_guide_buckets: string[];
}

const IMPORT_BATCH = "study-guide-import-2026-08-19";

export interface SeedResult {
  log: string[];
  totalQuestions: number;
  statusCounts: Record<string, number>;
  examEligible: number;
}

/**
 * Shared seed logic — called by `prisma/seed.ts` (local/CLI) and by the
 * admin-only `/api/system/seed` route (for seeding a remote deploy's
 * database, e.g. Netlify DB, where there's no direct DB network access to
 * run the CLI script from outside the deployed environment).
 */
export async function runSeed(prisma: PrismaClient, adminEmail: string, adminPassword: string): Promise<SeedResult> {
  const log: string[] = [];
  const say = (s: string) => log.push(s);

  say("== Seeding ServiceNow CSA Prep Platform ==");

  // -------------------------------------------------------------------
  // 1. Users
  // -------------------------------------------------------------------
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: "Platform Administrator",
      role: Role.ADMIN,
      profile: { create: {} },
    },
  });
  say(`Admin user ready: ${admin.email}`);

  const demoPasswordHash = await bcrypt.hash("Demo1234!", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash: demoPasswordHash,
      name: "Demo Candidate",
      role: Role.USER,
      profile: { create: {} },
    },
  });
  say(`Demo user ready: ${demo.email} (password: Demo1234!)`);

  // -------------------------------------------------------------------
  // 2. Blueprint, domains, topics, subtopics
  // -------------------------------------------------------------------
  const blueprint = await prisma.blueprintVersion.upsert({
    where: { version: BLUEPRINT_VERSION.version },
    update: { ...BLUEPRINT_VERSION },
    create: { ...BLUEPRINT_VERSION },
  });
  say(`Blueprint version: ${blueprint.version} (${blueprint.status})`);

  const topicIdBySlug = new Map<string, string>();
  const domainIdByCode = new Map<string, string>();

  for (const d of DOMAINS) {
    const domain = await prisma.examDomain.upsert({
      where: { blueprintVersionId_code: { blueprintVersionId: blueprint.id, code: d.code } },
      update: { name: d.name, description: d.description, weightPercent: d.weightPercent },
      create: {
        blueprintVersionId: blueprint.id,
        code: d.code,
        name: d.name,
        description: d.description,
        weightPercent: d.weightPercent,
        sortOrder: DOMAINS.indexOf(d),
      },
    });
    domainIdByCode.set(d.code, domain.id);

    for (const t of d.topics) {
      const content = TOPIC_CONTENT[t.slug];
      const topic = await prisma.topic.upsert({
        where: { slug: t.slug },
        update: { name: t.name, domainId: domain.id },
        create: {
          slug: t.slug,
          name: t.name,
          domainId: domain.id,
          sortOrder: d.topics.indexOf(t),
          overview: content?.overview,
          whyItMatters: content?.whyItMatters,
          coreConcepts: content?.coreConcepts,
          terminology: content?.terminology,
          howItWorks: content?.howItWorks,
          adminTasks: content?.adminTasks,
          examFocus: content?.examFocus,
          commonTraps: content?.commonTraps,
          exampleScenario: content?.exampleScenario,
          validationStatus: ValidationStatus.DRAFT,
        },
      });
      topicIdBySlug.set(t.slug, topic.id);

      for (const st of t.subtopics ?? []) {
        await prisma.subtopic.upsert({
          where: { slug: st.slug },
          update: { name: st.name, topicId: topic.id },
          create: { slug: st.slug, name: st.name, topicId: topic.id, sortOrder: (t.subtopics ?? []).indexOf(st) },
        });
      }
    }
  }
  say(`Seeded ${DOMAINS.length} domains, ${topicIdBySlug.size} topics.`);

  // -------------------------------------------------------------------
  // 3. Documentation sources + topic-level validation pass
  // -------------------------------------------------------------------
  const verifiedTopicSlugs = new Set<string>();
  const topicPrimarySource = new Map<string, { title: string; url: string }>();

  for (const src of TOPIC_SOURCES) {
    const check = DocumentationValidator.validateSourceUrl(src.url);
    if (!check.accepted) {
      say(`  SKIPPED non-allowlisted source for ${src.topicSlug}: ${src.url} (${check.reason})`);
      continue;
    }

    const docSource =
      (await prisma.documentationSource.findFirst({ where: { url: src.url } })) ??
      (await prisma.documentationSource.create({
        data: {
          title: src.title,
          url: src.url,
          domainHost: src.domainHost,
          tier: src.tier,
          productVersion: src.productVersion,
          excerpt: src.excerpt,
          fetchedAt: new Date(),
        },
      }));

    const topicId = topicIdBySlug.get(src.topicSlug);
    if (!topicId) continue;

    await prisma.topicSource.upsert({
      where: { topicId_sourceId: { topicId, sourceId: docSource.id } },
      update: {},
      create: { topicId, sourceId: docSource.id },
    });

    await prisma.topic.update({
      where: { id: topicId },
      data: {
        validationStatus: ValidationStatus.VERIFIED,
        lastValidatedAt: new Date(),
        validationNotes:
          src.validationNotes ?? `Verified against official ServiceNow documentation: "${src.title}" (${src.url}).`,
      },
    });

    await prisma.contentAuditLog.create({
      data: {
        entityType: "topic",
        entityId: topicId,
        action: ContentAuditAction.VALIDATE,
        actorId: admin.id,
        after: { status: "VERIFIED", sourceUrl: src.url },
        notes: `Topic-level validation pass (${IMPORT_BATCH}) against confirmed official source.`,
      },
    });

    verifiedTopicSlugs.add(src.topicSlug);
    topicPrimarySource.set(src.topicSlug, { title: src.title, url: src.url });
  }
  say(`Validated ${verifiedTopicSlugs.size}/${topicIdBySlug.size} topics against real official ServiceNow sources.`);

  // -------------------------------------------------------------------
  // 4. Flashcards
  // -------------------------------------------------------------------
  for (const fc of FLASHCARDS) {
    const topicId = topicIdBySlug.get(fc.topicSlug);
    const src = topicPrimarySource.get(fc.topicSlug);
    const existing = await prisma.flashcard.findFirst({ where: { term: fc.term, topicId } });
    if (existing) continue;
    await prisma.flashcard.create({
      data: {
        term: fc.term,
        definition: fc.definition,
        contrastTerm: fc.contrastTerm,
        contrastDefinition: fc.contrastDefinition,
        topicId,
        validationStatus: src ? ValidationStatus.VERIFIED : ValidationStatus.DRAFT,
        officialSourceTitle: src?.title,
        officialSourceUrl: src?.url,
        lastValidatedAt: src ? new Date() : null,
      },
    });
  }
  say(`Seeded ${FLASHCARDS.length} flashcards.`);

  // -------------------------------------------------------------------
  // 5a. Import the 120 study-guide questions
  // -------------------------------------------------------------------
  const raw = rawImportedQuestions as unknown as RawImportedQuestion[];
  let importedCount = 0;
  const statusCounts: Record<string, number> = {};

  for (const q of raw) {
    const topicSlug = mapQuestionToTopicSlug({
      questionText: q.question_text,
      explanation: q.explanation_lines.join(" "),
      options: q.options,
      studyGuideBuckets: q.study_guide_buckets,
    });
    const topicId = topicIdBySlug.get(topicSlug);
    const topic = topicId ? await prisma.topic.findUnique({ where: { id: topicId } }) : null;
    const domainId = topic?.domainId ?? domainIdByCode.get("D5")!;

    const questionType = q.choose_n && q.choose_n > 1 ? QuestionType.MULTIPLE_SELECT : QuestionType.SINGLE_CHOICE;
    const difficulty = estimateDifficulty({ questionText: q.question_text, questionType });

    const requiredSelectionCountConsistent =
      questionType === QuestionType.SINGLE_CHOICE
        ? q.correct_options.length === 1
        : q.correct_options.length === (q.choose_n ?? q.correct_options.length);

    const topicState = {
      hasVerifiedSource: verifiedTopicSlugs.has(topicSlug),
      sourceTitle: topicPrimarySource.get(topicSlug)?.title,
      sourceUrl: topicPrimarySource.get(topicSlug)?.url,
      hasConflict: topicSlug === "csdm",
    };
    const validation = DocumentationValidator.validateQuestionAgainstTopic(
      {
        questionText: q.question_text,
        explanation: q.explanation_lines.join(" "),
        correctOptionTexts: q.correct_options,
        importMatchConfidence: q._match_confidence,
      },
      topicState,
    );

    const explanation = q.explanation_lines.join(" ") || "Explanation pending admin review.";
    const qualityScore = computeQualityScore({
      hasExplanation: q.explanation_lines.length > 0,
      explanationLength: explanation.length,
      optionCount: q.options.length,
      importMatchConfidence: q._match_confidence,
      requiredSelectionCountConsistent,
      validationStatus: validation.status,
      hasOfficialSource: !!topicState.sourceUrl,
      questionType,
    });

    const created = await prisma.question.create({
      data: {
        questionText: q.question_text,
        questionType,
        difficulty,
        domainId,
        topicId,
        requiredSelectionCount: questionType === QuestionType.MULTIPLE_SELECT ? q.choose_n : null,
        explanation,
        originIsAiGenerated: false,
        originImportBatch: IMPORT_BATCH,
        originalImportedText: {
          source: "ServiceNow_CSA_Study_Guide.docx",
          questionNumber: q.number,
          question_text: q.question_text,
          options: q.options,
          correct_raw: q.correct_raw,
          explanation_lines: q.explanation_lines,
          study_guide_buckets: q.study_guide_buckets,
        },
        officialSourceTitle: topicState.sourceTitle,
        officialSourceUrl: topicState.sourceUrl,
        sourceVersion: blueprint.version,
        validationStatus: validation.status,
        lastValidatedAt: new Date(),
        validationNotes: validation.notes,
        qualityScore,
        examEligible: qualityScore >= EXAM_ELIGIBLE_THRESHOLD,
        examPreferred: qualityScore >= EXAM_PREFERRED_THRESHOLD,
        createdById: admin.id,
        options: {
          create: q.options.map((text, idx) => ({
            text,
            isCorrect: q.correct_options.includes(text),
            sortOrder: idx,
          })),
        },
      },
      include: { options: true },
    });

    await prisma.questionVersion.create({
      data: {
        questionId: created.id,
        versionNumber: 1,
        blueprintLabel: blueprint.version,
        status: validation.status,
        snapshot: {
          questionText: created.questionText,
          questionType: created.questionType,
          options: created.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
          explanation: created.explanation,
        },
        changeSummary: "Initial import from ServiceNow_CSA_Study_Guide.docx (seed source content, unverified until validated).",
        createdById: admin.id,
      },
    });

    await prisma.questionValidation.create({
      data: {
        questionId: created.id,
        status: validation.status,
        validatedById: admin.id,
        isAutomated: validation.isAutomated,
        primarySourceId: topicState.sourceUrl
          ? (await prisma.documentationSource.findFirst({ where: { url: topicState.sourceUrl } }))?.id
          : null,
        hasConflict: !!topicState.hasConflict,
        originalAnswerText: q.correct_raw,
        verifiedAnswerText: q.correct_options.join(", "),
        notes: validation.notes,
      },
    });

    await prisma.contentAuditLog.create({
      data: {
        entityType: "question",
        entityId: created.id,
        action: ContentAuditAction.IMPORT,
        actorId: admin.id,
        after: { validationStatus: validation.status, qualityScore },
        notes: `Imported from study guide question #${q.number}; mapped to topic '${topicSlug}'.`,
      },
    });

    importedCount++;
    statusCounts[validation.status] = (statusCounts[validation.status] ?? 0) + 1;
  }
  say(`Imported ${importedCount} questions from the study guide.`);
  say(`  Status breakdown: ${JSON.stringify(statusCounts)}`);

  // -------------------------------------------------------------------
  // 5b. Supplemental, originally-authored questions (fills D1/D2 gaps)
  // -------------------------------------------------------------------
  let supplementalCount = 0;
  for (const q of SUPPLEMENTAL_QUESTIONS) {
    const topicId = topicIdBySlug.get(q.topicSlug);
    const topic = topicId ? await prisma.topic.findUnique({ where: { id: topicId } }) : null;
    const domainId = topic?.domainId;
    if (!domainId) continue;

    const src = topicPrimarySource.get(q.topicSlug);
    const status = src ? ValidationStatus.VERIFIED : ValidationStatus.NEEDS_REVIEW;
    const notes = src
      ? `Original practice question authored directly against official source "${src.title}" (${src.url}). Manually authored and cited — not an automated pass.`
      : "Original practice question authored for blueprint coverage; no confirmed official source on file yet for this topic, so held at NEEDS_REVIEW pending validation.";

    const qualityScore = computeQualityScore({
      hasExplanation: true,
      explanationLength: q.explanation.length,
      optionCount: q.options.length,
      importMatchConfidence: 1,
      requiredSelectionCountConsistent: true,
      validationStatus: status,
      hasOfficialSource: !!src,
      questionType: q.questionType,
    });

    const created = await prisma.question.create({
      data: {
        questionText: q.questionText,
        questionType: q.questionType,
        difficulty: q.difficulty,
        domainId,
        topicId,
        requiredSelectionCount: q.questionType === QuestionType.MULTIPLE_SELECT ? q.requiredSelectionCount : null,
        explanation: q.explanation,
        examTip: q.examTip,
        originIsAiGenerated: false,
        originImportBatch: "supplemental-authored-2026-08-19",
        officialSourceTitle: src?.title,
        officialSourceUrl: src?.url,
        sourceVersion: blueprint.version,
        validationStatus: status,
        lastValidatedAt: new Date(),
        validationNotes: notes,
        qualityScore,
        examEligible: qualityScore >= EXAM_ELIGIBLE_THRESHOLD,
        examPreferred: qualityScore >= EXAM_PREFERRED_THRESHOLD,
        createdById: admin.id,
        options: {
          create: q.options.map((text, idx) => ({ text, isCorrect: q.correctOptions.includes(text), sortOrder: idx })),
        },
      },
      include: { options: true },
    });

    await prisma.questionVersion.create({
      data: {
        questionId: created.id,
        versionNumber: 1,
        blueprintLabel: blueprint.version,
        status,
        snapshot: {
          questionText: created.questionText,
          questionType: created.questionType,
          options: created.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
          explanation: created.explanation,
        },
        changeSummary: "Original supplemental question authored to fill Domain 1/2 blueprint coverage gaps.",
        createdById: admin.id,
      },
    });

    await prisma.questionValidation.create({
      data: {
        questionId: created.id,
        status,
        validatedById: admin.id,
        isAutomated: false,
        primarySourceId: src ? (await prisma.documentationSource.findFirst({ where: { url: src.url } }))?.id : null,
        verifiedAnswerText: q.correctOptions.join(", "),
        notes,
      },
    });

    supplementalCount++;
  }
  say(`Seeded ${supplementalCount} original supplemental questions (Domain 1 & 2 coverage).`);

  // -------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------
  const total = await prisma.question.count();
  const byStatus = await prisma.question.groupBy({ by: ["validationStatus"], _count: true });
  const eligible = await prisma.question.count({ where: { examEligible: true } });
  const statusCountsFinal: Record<string, number> = {};
  say("== Seed complete ==");
  say(`Total questions: ${total}`);
  for (const row of byStatus) {
    statusCountsFinal[row.validationStatus] = row._count;
    say(`  ${row.validationStatus}: ${row._count}`);
  }
  say(`Exam-eligible (quality >= ${EXAM_ELIGIBLE_THRESHOLD}): ${eligible}`);

  return { log, totalQuestions: total, statusCounts: statusCountsFinal, examEligible: eligible };
}
