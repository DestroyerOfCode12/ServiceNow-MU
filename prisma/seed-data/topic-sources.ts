/**
 * Real, fetched-and-confirmed official ServiceNow documentation sources, gathered
 * during the initial content-validation pass (2026-08-19) via live web search/fetch
 * against servicenow.com. Every URL here was individually confirmed reachable and
 * on-topic before being added — see ALLOWED_SOURCE_HOSTS in
 * src/lib/validation/source-allowlist.ts for the host allowlist this respects.
 *
 * This is a *representative* pass covering 16 of the 26 canonical topics across
 * all 6 CSA domains — not exhaustive. Topics without an entry here remain
 * `validationStatus: DRAFT` until a future validation pass covers them; see the
 * Admin > Validation dashboard for current status. Nothing is marked VERIFIED
 * without a citation captured below.
 */

export interface TopicSourceSeed {
  topicSlug: string;
  title: string;
  url: string;
  domainHost: string;
  tier: "TIER1" | "TIER2" | "TIER3";
  productVersion?: string;
  excerpt: string;
  validationNotes?: string;
}

export const TOPIC_SOURCES: TopicSourceSeed[] = [
  {
    topicSlug: "access-control",
    title: "Exploring Access Control Lists",
    url: "https://www.servicenow.com/docs/bundle/xanadu-platform-security/page/administer/contextual-security/concept/exploring-access-control-list.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Xanadu",
    excerpt:
      "Explains ACL decision types (Deny-Unless, Allow-If), rule types (record/field), operations, and evaluation from most specific to most general.",
  },
  {
    topicSlug: "csdm",
    title: "CSDM data domains — Common Service Data Model conceptual model",
    url: "https://www.servicenow.com/docs/bundle/xanadu-servicenow-platform/page/product/csdm-implementation/concept/csdm-conceptual-model.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Xanadu",
    excerpt:
      "Describes six official CSDM domains: Foundation, Design, Build, Manage Technical Services, Sell/Consume, and Manage Portfolio.",
    validationNotes:
      "SOURCE CONFLICT noted during validation: a ServiceNow CSDM 5.0 whitepaper (community-hosted resource) describes seven domains with different names (Foundation, Ideation & Strategy, Design & Planning, Build & Integration, Service Delivery, Service Consumption, Manage Portfolios), while this Tier-1 product-documentation page describes six. Per source-conflict policy, the Tier-1 product doc wins for platform terminology; the whitepaper reflects a newer/marketing framing of the same model. CSDM has also evolved materially across versions (3/4/5) — content should be re-checked against whichever CSDM version the current CSA blueprint references.",
  },
  {
    topicSlug: "cmdb",
    title: "Overview of CMDB",
    url: "https://www.servicenow.com/docs/r/xanadu/servicenow-platform/configuration-management-database-cmdb/cnfig-mgmt-and-cmdb.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Xanadu",
    excerpt:
      "Defines the CMDB as storing Configuration Items and their relationships/dependencies to support IT service management.",
  },
  {
    topicSlug: "security-center",
    title: "Customer Actions (Security Center)",
    url: "https://www.servicenow.com/docs/bundle/xanadu-platform-security/page/administer/security-center/concept/critical-updates.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Xanadu",
    excerpt:
      "Customer Actions are manual, guided tasks for admins to implement important security changes, complementing automatic system updates.",
  },
  {
    topicSlug: "shared-responsibility-model",
    title: "ServiceNow Shared Responsibility Model (white paper)",
    url: "https://www.servicenow.com/content/dam/servicenow-assets/public/en-us/doc-type/resource-center/white-paper/wp-shared-responsibility-model.pdf",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    excerpt:
      "Official white paper describing the security partnership between ServiceNow (platform infrastructure) and customers (data, access, configuration), including shared areas.",
  },
  {
    topicSlug: "installing-applications-plugins",
    title: "Activate a plugin",
    url: "https://www.servicenow.com/docs/r/platform-administration/t_ActivateAPlugin.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    excerpt: "Step-by-step official instructions for activating a plugin as an administrator.",
  },
  {
    topicSlug: "unified-navigation",
    title: "Using the Next Experience Unified Navigation",
    url: "https://www.servicenow.com/docs/r/platform-user-interface/using-the-next-experience-global-header.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    excerpt: "Describes the All menu, Favorites menu, History menu, and Workspaces menu in the unified navigation header.",
  },
  {
    topicSlug: "importing-data",
    title: "Coalesce a field on a transform map",
    url: "https://www.servicenow.com/docs/csh?topicname=c_ImportSetCoalesce.html&version=latest",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    excerpt: "Defines coalesce as the transform-map setting that determines whether an import updates an existing record or inserts a new one.",
  },
  {
    topicSlug: "workflow-studio",
    title: "Workflow Studio actions",
    url: "https://www.servicenow.com/docs/bundle/xanadu-build-workflows/page/administer/flow-designer/concept/flow-actions.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Xanadu",
    excerpt: "Documents core Flow Designer actions (e.g. Create Record, Ask for Approval) available regardless of installed spokes.",
  },
  {
    topicSlug: "virtual-agent",
    title: "Virtual Agent",
    url: "https://www.servicenow.com/docs/bundle/zurich-conversational-interfaces/page/administer/virtual-agent/concept/virtual-agent-landing-page.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Zurich",
    excerpt: "Describes Virtual Agent as a conversational, messaging-based self-service experience with pre-built, AI-powered conversations.",
  },
  {
    topicSlug: "knowledge-management",
    title: "Control access at the knowledge base level through user criteria",
    url: "https://www.servicenow.com/docs/bundle/yokohama-servicenow-platform/page/product/knowledge-management/task/t_SelectUserCriteria.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Yokohama",
    excerpt: "Confirms User Criteria (Can Read/Can Contribute) is the mechanism controlling knowledge base access.",
  },
  {
    topicSlug: "task-management-vtb",
    title: "Add or modify Visual Task Board lanes",
    url: "https://www.servicenow.com/docs/bundle/yokohama-platform-user-interface/page/use/visual-task-boards/task/t_AddOrModifyALane.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Yokohama",
    excerpt: "Describes lanes as the organizing structure of a Visual Task Board across freeform, flexible, and guided board types.",
  },
  {
    topicSlug: "notifications",
    title: "Create an email notification",
    url: "https://www.servicenow.com/docs/bundle/xanadu-platform-administration/page/administer/notification/task/t_CreateANotification.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Xanadu",
    excerpt: "Official steps for creating a notification specifying when to send it, who receives it, and what it contains.",
  },
  {
    topicSlug: "system-update-sets",
    title: "System update sets",
    url: "https://www.servicenow.com/docs/bundle/xanadu-application-development/page/build/system-update-sets/concept/system-update-sets.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Xanadu",
    excerpt: "Defines an update set as a group of configuration changes that can be moved from one instance to another.",
  },
  {
    topicSlug: "ui-policies",
    title: "Using UI policies",
    url: "https://www.servicenow.com/docs/r/platform-administration/t_CreateAUIPolicy.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    excerpt:
      "Confirms UI policies dynamically control form field Mandatory/Read-only/Visible state and walks through creating one.",
  },
  {
    topicSlug: "visualizations-dashboards-pa",
    title: "Indicator sources (Performance Analytics)",
    url: "https://www.servicenow.com/docs/r/now-intelligence/performance-analytics/c_IndicatorSources.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    excerpt: "Confirms Performance Analytics Indicators track a situation over time via periodically collected historical data.",
  },
  {
    topicSlug: "service-catalog",
    title: "View catalog tasks",
    url: "https://www.servicenow.com/docs/bundle/washingtondc-it-service-management/page/product/incident-management/concept/catalog-tasks.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Washington DC",
    excerpt: "Confirms catalog tasks are associated with a service catalog item and used to source items and fulfill requests.",
  },
  {
    topicSlug: "servicenow-instance",
    title: "MID Server",
    url: "https://www.servicenow.com/docs/bundle/zurich-servicenow-platform/page/product/mid-server/concept/mid-server-landing.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Zurich",
    excerpt:
      "Defines the MID Server as a customer-installed Java application bridging a ServiceNow instance to internal network resources — confirms it is not part of core instance architecture.",
  },
  {
    topicSlug: "platform-overview",
    title: "How the ServiceNow AI Platform works",
    url: "https://www.servicenow.com/docs/r/platform-administration/how-now-platform-works.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    excerpt: "Describes the Now Platform as the unified foundation for every ServiceNow product/application.",
  },
  {
    topicSlug: "scripting-in-servicenow",
    title: "Client scripts",
    url: "https://www.servicenow.com/docs/bundle/xanadu-application-development/page/script/client-scripts/concept/client-scripts.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Xanadu",
    excerpt: "Confirms Client Scripts run JavaScript in the browser on client events (onLoad, onChange, onSubmit).",
  },
  {
    topicSlug: "common-user-interfaces",
    title: "UI Builder and configurable workspaces",
    url: "https://www.servicenow.com/docs/bundle/yokohama-application-development/page/administer/ui-builder/concept/ui-builder-csm-workspace.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Yokohama",
    excerpt: "Describes a workspace as a focused working area and UI Builder as the tool used to build/extend it.",
  },
  {
    topicSlug: "forms",
    title: "Form layout (Configuring the form layout)",
    url: "https://www.servicenow.com/docs/bundle/zurich-platform-administration/page/administer/form-administration/concept/configure-form-layout.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    productVersion: "Zurich",
    excerpt: "Covers form layout configuration: showing/hiding fields, sections, related lists, and the personalize_form role.",
  },
  {
    topicSlug: "business-rules",
    title: "Business rules and script includes",
    url: "https://www.servicenow.com/docs/r/application-development/business-rules-and-script-includes.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    excerpt: "Confirms Business Rules are server-side scripts that run during CRUD operations (before/after/async/display).",
  },
  {
    topicSlug: "lists-filters-tags",
    title: "Personal lists",
    url: "https://www.servicenow.com/docs/r/platform-user-interface/c_PersonalLists.html",
    domainHost: "www.servicenow.com",
    tier: "TIER1",
    excerpt: "Describes personalizing a list's columns, order, and display options as a per-user customization.",
  },
];
