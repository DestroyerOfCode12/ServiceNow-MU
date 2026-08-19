/**
 * Maps an imported study-guide question onto the platform's *current* canonical
 * topic taxonomy (see prisma/seed-data/blueprint.ts). The study guide's own topic
 * index groups several distinct CSA-blueprint topics together (e.g. "UI Policy /
 * Business Rules / Client Scripts" as one bucket) — per spec section 60, we do not
 * assume that bucket structure matches the current blueprint, so this mapper
 * inspects each question's own text first and only falls back to the study
 * guide's bucket label when no keyword rule matches.
 *
 * Rules are ordered most-specific-first; the first match wins.
 */

export interface TopicMapRule {
  pattern: RegExp;
  topicSlug: string;
}

export const KEYWORD_RULES: TopicMapRule[] = [
  { pattern: /update set/i, topicSlug: "system-update-sets" },
  { pattern: /coalesce|transform map|staging table/i, topicSlug: "importing-data" },
  { pattern: /shared responsibility/i, topicSlug: "shared-responsibility-model" },
  { pattern: /security center|customer action/i, topicSlug: "security-center" },
  { pattern: /\bacl\b|access control (list|rule)/i, topicSlug: "access-control" },
  { pattern: /security_admin|knowledge_admin|admin overrides|\brole\b/i, topicSlug: "access-control" },
  { pattern: /ui policy|ui policies/i, topicSlug: "ui-policies" },
  { pattern: /business rule/i, topicSlug: "business-rules" },
  {
    pattern: /client script|glideajax|gliderecord|glidesystem|script include|jelly script|\bapis?\b.*(server|client)|javascript/i,
    topicSlug: "scripting-in-servicenow",
  },
  { pattern: /csdm|domain layer|service data model/i, topicSlug: "csdm" },
  { pattern: /\bcmdb\b|configuration item|\bci\b\)/i, topicSlug: "cmdb" },
  { pattern: /virtual agent/i, topicSlug: "virtual-agent" },
  { pattern: /flow designer|workflow studio|data pill|subflow|core action/i, topicSlug: "workflow-studio" },
  {
    pattern: /catalog|record producer|variable set|\breq\b|\britm\b|sctask|maintain items/i,
    topicSlug: "service-catalog",
  },
  { pattern: /knowledge (base|article|management)/i, topicSlug: "knowledge-management" },
  { pattern: /visual task board|\bvtb\b/i, topicSlug: "task-management-vtb" },
  { pattern: /performance analytics|\bdashboard\b|\breport\b|visualization|indicator/i, topicSlug: "visualizations-dashboards-pa" },
  { pattern: /notification/i, topicSlug: "notifications" },
  { pattern: /plugin|application manager|now support|servicenow store|app(lication)? scop/i, topicSlug: "installing-applications-plugins" },
  {
    pattern: /\btemplate\b|related list|saving option|form (anatomy|configuration|layout|context menu)|mandatory field|activity stream/i,
    topicSlug: "forms",
  },
  { pattern: /\blist\b|\bfilter\b|\btag\b|breadcrumb/i, topicSlug: "lists-filters-tags" },
  { pattern: /all menu|favorites|global search|globe icon|unified navigation/i, topicSlug: "unified-navigation" },
  { pattern: /mid server|load balancer|instance architecture|core architecture/i, topicSlug: "servicenow-instance" },
  { pattern: /workspace|service portal|employee center/i, topicSlug: "common-user-interfaces" },
  { pattern: /personaliz|theme|user preference/i, topicSlug: "personalizing-the-instance" },
  { pattern: /table extend|dictionary entry|task table|inherit/i, topicSlug: "data-schema" },
];

/** Fallback when no keyword rule matches: the study guide's original bucket, mapped to its closest current topic. */
export const BUCKET_FALLBACK: Record<string, string> = {
  "Update Sets & Migration": "system-update-sets",
  "ACLs & Security Model": "access-control",
  "UI Policy / Business Rules / Client Scripts": "ui-policies",
  "Shared Responsibility Model": "shared-responsibility-model",
  "Security Center": "security-center",
  "Service Catalog & Fulfillment": "service-catalog",
  "Knowledge Management": "knowledge-management",
  "CMDB & CSDM": "cmdb",
  "Flow Designer / Workflow Studio / Virtual Agent": "workflow-studio",
  "Forms, Lists, Views & Navigation": "forms",
  "Import Sets & Transform/Coalesce": "importing-data",
  "Visual Task Boards": "task-management-vtb",
  "Reports/Dashboards/Performance Analytics": "visualizations-dashboards-pa",
  "Application Management/Plugins": "installing-applications-plugins",
  "Roles & Permissions": "access-control",
};

export function mapQuestionToTopicSlug(params: {
  questionText: string;
  explanation: string;
  options: string[];
  studyGuideBuckets: string[];
}): string {
  const haystack = [params.questionText, params.explanation, params.options.join(" ")].join(" ");

  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(haystack)) return rule.topicSlug;
  }

  for (const bucket of params.studyGuideBuckets) {
    if (BUCKET_FALLBACK[bucket]) return BUCKET_FALLBACK[bucket];
  }

  // Last resort — should be rare; flagged for admin attention via NEEDS_REVIEW anyway.
  return "platform-overview";
}
