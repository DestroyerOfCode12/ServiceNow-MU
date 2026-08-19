/**
 * Seed flashcards — the "A vs B" distinctions that repeatedly trip up CSA
 * candidates. `topicSlug` links each card to its canonical topic page.
 */

export interface FlashcardSeed {
  term: string;
  definition: string;
  contrastTerm?: string;
  contrastDefinition?: string;
  topicSlug: string;
}

export const FLASHCARDS: FlashcardSeed[] = [
  {
    term: "UI Policy",
    definition:
      "Declarative, client-side control of Mandatory/Read-only/Visible field state, driven by form conditions. Applies immediately in the browser.",
    contrastTerm: "Client Script",
    contrastDefinition:
      "Custom JavaScript reacting to onLoad/onChange/onSubmit form events for behavior beyond simple field-state changes. Also client-side, but scripted rather than declarative.",
    topicSlug: "ui-policies",
  },
  {
    term: "Business Rule",
    definition:
      "Server-side script that runs on database operations (before/after/async/query), applying reliably regardless of which client or integration wrote the record.",
    contrastTerm: "Client Script",
    contrastDefinition:
      "Runs only in the user's browser against the form; can be bypassed by direct API/integration writes since it never executes server-side.",
    topicSlug: "business-rules",
  },
  {
    term: "Data Policy",
    definition:
      "Enforces field mandatory/read-only rules server-side, applying to every write path — UI, API, and import — not just the form.",
    contrastTerm: "UI Policy",
    contrastDefinition:
      "Enforces the same kind of field state, but only client-side on the form; does not protect against API or import writes bypassing the form entirely.",
    topicSlug: "ui-policies",
  },
  {
    term: "Update Set",
    definition:
      "A movable package of configuration changes (fields, scripts, forms, etc.) captured for promotion between instances (e.g., dev → prod).",
    contrastTerm: "Application",
    contrastDefinition:
      "A scoped, self-contained bundle of tables, logic, and UI representing an entire piece of functionality — typically installed via plugin/Store, not captured incrementally like an Update Set.",
    topicSlug: "system-update-sets",
  },
  {
    term: "REQ (Request)",
    definition:
      "The top-level record created when a user checks out of the Service Catalog — represents the overall order, which can contain multiple items.",
    contrastTerm: "RITM (Requested Item)",
    contrastDefinition:
      "One line item within a Request, representing a single catalog item ordered; a Request can have multiple RITMs.",
    topicSlug: "service-catalog",
  },
  {
    term: "RITM (Requested Item)",
    definition: "One catalog item within a Request; the unit fulfillment work is organized around.",
    contrastTerm: "SCTASK (Catalog Task)",
    contrastDefinition:
      "A specific unit of fulfillment work spawned from a RITM (e.g., 'provision laptop'); a RITM can generate one or more SCTASKs assigned to fulfillment groups.",
    topicSlug: "service-catalog",
  },
  {
    term: "CMDB",
    definition:
      "The Configuration Management Database — the actual data store of Configuration Items (CIs) and their relationships.",
    contrastTerm: "CSDM",
    contrastDefinition:
      "The Common Service Data Model — the blueprint/framework prescribing how that CMDB data should be organized into layers (Foundation, Design, Build, Consume, etc.).",
    topicSlug: "csdm",
  },
  {
    term: "Table-level ACL",
    definition: "Governs access (create/read/write/delete) to an entire record on a table.",
    contrastTerm: "Field-level ACL",
    contrastDefinition:
      "Governs access to one specific field on a table; evaluated after table-level ACLs, from most specific field match to most general.",
    topicSlug: "access-control",
  },
  {
    term: "Import Set",
    definition: "A staging table holding raw data exactly as imported (CSV, XML, JDBC, web service, etc.), before transformation.",
    contrastTerm: "Transform Map",
    contrastDefinition:
      "Defines the field mappings that move data from an Import Set staging table into a real target table, including which field(s) are used to Coalesce (match) existing records.",
    topicSlug: "importing-data",
  },
  {
    term: "Coalesce",
    definition:
      "A field flagged on a Transform Map as the match key: if a target record already matches on that value, the transform updates it; otherwise it inserts a new record.",
    topicSlug: "importing-data",
  },
  {
    term: "Report",
    definition: "A single visualization/summary built from one table's current data.",
    contrastTerm: "Performance Analytics Indicator",
    contrastDefinition:
      "A metric tracked over time via periodic historical snapshots, enabling trend analysis a point-in-time report can't provide.",
    topicSlug: "visualizations-dashboards-pa",
  },
  {
    term: "Dashboard",
    definition: "A single page combining multiple reports/widgets for a combined view of current data.",
    contrastTerm: "Performance Analytics",
    contrastDefinition: "A time-series analytics engine tracking Indicator scores historically, not just a layout/aggregation of current reports.",
    topicSlug: "visualizations-dashboards-pa",
  },
  {
    term: "Plugin",
    definition: "A modular, ServiceNow-authored platform feature that an admin (or, for restricted plugins, Now Support) can activate on an instance.",
    contrastTerm: "ServiceNow Store application",
    contrastDefinition: "A certified app (ServiceNow or partner-built) installed from the Store marketplace, often into its own scoped application.",
    topicSlug: "installing-applications-plugins",
  },
  {
    term: "Virtual Agent",
    definition: "Conversational, chat-based self-service that resolves simple requests or escalates to a live agent.",
    contrastTerm: "Service Catalog / Record Producer",
    contrastDefinition: "Form-based self-service — the user fills out structured fields rather than conversing in natural language.",
    topicSlug: "virtual-agent",
  },
  {
    term: "Flow Designer Trigger",
    definition: "Defines what starts a flow — a record event, a schedule, or another flow calling it.",
    contrastTerm: "Data Pill",
    contrastDefinition: "A reference carrying one action's output data into a later action's input within the same flow.",
    topicSlug: "workflow-studio",
  },
  {
    term: "Visual Task Board (VTB)",
    definition: "A Kanban-style, drag-and-drop board view of task records grouped into lanes by a field's value.",
    contrastTerm: "List",
    contrastDefinition: "A tabular, row-and-column view of the same underlying records — a different presentation of identical data, not a separate store.",
    topicSlug: "task-management-vtb",
  },
  {
    term: "All menu",
    definition: "The full application/module navigator in Next Experience Unified Navigation.",
    contrastTerm: "Favorites menu",
    contrastDefinition: "User-saved shortcuts only — a personal subset, not the complete module list.",
    topicSlug: "unified-navigation",
  },
  {
    term: "Form Template",
    definition: "A saved set of field values a user applies to pre-fill a new record; values remain editable afterward.",
    contrastTerm: "UI Policy / Data Policy",
    contrastDefinition: "Enforce or restrict field state (mandatory/read-only/visible) — they don't pre-fill values, and can't be bypassed the way a template's suggestion can.",
    topicSlug: "forms",
  },
  {
    term: "Shared Responsibility Model",
    definition: "The framework clarifying which security/operational responsibilities belong to ServiceNow, which belong to the customer, and which are shared.",
    contrastTerm: "Security Center",
    contrastDefinition: "The operational dashboard that surfaces specific, actionable findings (like Customer Actions) — putting the Shared Responsibility Model into practice.",
    topicSlug: "shared-responsibility-model",
  },
  {
    term: "User Criteria",
    definition: "A reusable rule defining which users can view or contribute to a knowledge base (or see a catalog item).",
    contrastTerm: "ACL",
    contrastDefinition: "The platform's general-purpose table/field security mechanism; User Criteria is a narrower, catalog/knowledge-specific access layer built on top of it.",
    topicSlug: "knowledge-management",
  },
  {
    term: "Task table",
    definition: "The common parent table many process tables (Incident, Problem, Change, Case) extend, providing shared fields like State and Work notes.",
    contrastTerm: "Table extension",
    contrastDefinition: "The general mechanism by which any child table inherits its parent's fields — Task is simply the most common parent in ITSM/CSM contexts.",
    topicSlug: "data-schema",
  },
  {
    term: "MID Server",
    definition: "An optional, customer-installed agent bridging ServiceNow to internal/private networks (e.g. for Discovery or integrations).",
    contrastTerm: "Core instance architecture",
    contrastDefinition: "The base infrastructure ServiceNow provisions and manages (app servers, database, load balancer) — the MID Server is not part of it, despite feeling infrastructural.",
    topicSlug: "servicenow-instance",
  },
  {
    term: "GlideRecord / GlideSystem (APIs)",
    definition: "Platform-provided classes/methods offering reusable server- and client-side functionality.",
    contrastTerm: "Business Rule / Client Script",
    contrastDefinition: "Consumers of those APIs — they call GlideRecord/GlideSystem methods to do their work, rather than providing the underlying capability themselves.",
    topicSlug: "scripting-in-servicenow",
  },
];
