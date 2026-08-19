import { ValidationStatus } from "@prisma/client";
import { isOfficialSource } from "./source-allowlist";

/**
 * DocumentationValidator
 * -----------------------
 * The engine responsible for checking platform content against official
 * ServiceNow sources (spec sections 6 and 29). It is deliberately NOT built
 * around one hard-coded ServiceNow page — it operates on whatever
 * DocumentationSource records a topic has accumulated (added only through the
 * admin validation flow or a confirmed web-fetch pass), and never fabricates
 * a citation for content that doesn't have one.
 *
 * Two validation strengths are modeled:
 *
 *  - `validateTopicSource()` — call when an admin/automation attaches a new
 *    DocumentationSource to a topic. Its only job is to reject sources whose
 *    host isn't on the allowlist; it never trusts an arbitrary URL.
 *
 *  - `validateQuestionAgainstTopic()` — an automated, topic-level consistency
 *    check used for bulk passes (e.g. the initial content import). It can
 *    only ever promote a question to VERIFIED if the question's own topic
 *    already carries a confirmed official source; otherwise the question is
 *    left at NEEDS_REVIEW. This is explicitly weaker than a human reading the
 *    question against the cited documentation line-by-line, and every result
 *    is flagged `isAutomated: true` so the admin dashboard never conflates it
 *    with manual review. It never silently changes a question's content or
 *    answer — see section 33: only status/notes are written.
 */

export interface ConsistencyInput {
  questionText: string;
  explanation: string;
  correctOptionTexts: string[];
  importMatchConfidence: number; // 0-1, confidence the imported "correct answer" text was matched to the right option
}

export interface TopicSourceState {
  hasVerifiedSource: boolean;
  sourceTitle?: string;
  sourceUrl?: string;
  hasConflict?: boolean;
}

export interface ValidationResult {
  status: ValidationStatus;
  isAutomated: boolean;
  notes: string;
  qualityScoreDelta: number;
}

const MIN_CONFIDENCE_FOR_AUTO_VERIFY = 0.85;

export class DocumentationValidator {
  /** Reject any source whose host isn't on the approved ServiceNow allowlist (section 63). */
  static validateSourceUrl(url: string): { accepted: boolean; reason: string } {
    if (!isOfficialSource(url)) {
      return {
        accepted: false,
        reason:
          "URL host is not on the official-source allowlist. Only servicenow.com, docs.servicenow.com, developer.servicenow.com, nowlearning/learning.servicenow.com, and support.servicenow.com are accepted as citable sources.",
      };
    }
    return { accepted: true, reason: "Host is on the official-source allowlist." };
  }

  /**
   * Automated, topic-level consistency pass. Promotes a question to VERIFIED
   * only when its topic already has a confirmed official source AND the
   * import match confidence is high; otherwise leaves it at NEEDS_REVIEW.
   * Never claims certainty it doesn't have.
   */
  static validateQuestionAgainstTopic(
    _input: ConsistencyInput,
    topicState: TopicSourceState,
  ): ValidationResult {
    if (!topicState.hasVerifiedSource) {
      return {
        status: ValidationStatus.NEEDS_REVIEW,
        isAutomated: true,
        notes:
          "This question's topic does not yet have a confirmed official ServiceNow source on file. Marked NEEDS_REVIEW pending a documentation validation pass for this topic.",
        qualityScoreDelta: 0,
      };
    }

    if (topicState.hasConflict) {
      return {
        status: ValidationStatus.NEEDS_REVIEW,
        isAutomated: true,
        notes: `SOURCE CONFLICT on this question's topic (${topicState.sourceTitle ?? "topic source"}) — two official/semi-official sources disagree. Held at NEEDS_REVIEW until an admin resolves the conflict. See the topic's validation notes for both sources.`,
        qualityScoreDelta: -10,
      };
    }

    if (_input.importMatchConfidence < MIN_CONFIDENCE_FOR_AUTO_VERIFY) {
      return {
        status: ValidationStatus.NEEDS_REVIEW,
        isAutomated: true,
        notes: `Imported answer text matched an option with only ${(
          _input.importMatchConfidence * 100
        ).toFixed(0)}% confidence during parsing. Held for manual review before verification, even though the topic has a confirmed source.`,
        qualityScoreDelta: -5,
      };
    }

    return {
      status: ValidationStatus.VERIFIED,
      isAutomated: true,
      notes: `Automated topic-level validation: this question's topic (${topicState.sourceTitle}) has a confirmed official ServiceNow source and the imported answer was matched with high confidence. This is an automated, topic-level check — not a line-by-line manual read of the question against the source — see ${topicState.sourceUrl}.`,
      qualityScoreDelta: 25,
    };
  }

  /** Simple content-freshness check (section 28). */
  static isStale(lastValidatedAt: Date | null, staleDays = 180): boolean {
    if (!lastValidatedAt) return true;
    const ms = Date.now() - lastValidatedAt.getTime();
    return ms > staleDays * 24 * 60 * 60 * 1000;
  }
}
