/**
 * Structured study-page content for each canonical topic (see blueprint.ts for the
 * topic list). Written from well-established, publicly documented ServiceNow
 * platform behavior. Every topic is seeded as `validationStatus: DRAFT` unless a
 * later validation pass (scripts/validate-content.ts) upgrades it to VERIFIED with
 * a real, fetched official source — see the Admin > Validation dashboard for the
 * current status of each topic. Nothing here should be treated as officially
 * verified until it carries a citation and a `lastValidatedAt` date.
 */

export interface TopicContent {
  overview: string;
  whyItMatters: string;
  coreConcepts: string;
  terminology: string;
  howItWorks: string;
  adminTasks: string;
  examFocus: string;
  commonTraps: string;
  exampleScenario: string;
}

export const TOPIC_CONTENT: Record<string, TopicContent> = {
  "platform-overview": {
    overview:
      "The Now Platform is ServiceNow's single data model, workflow, and UI foundation. Every application you use — ITSM, HR, CSM, custom scoped apps — runs on the same platform services: a shared database, a role-based security model, a scripting/automation layer, and a common UI framework.",
    whyItMatters:
      "The CSA exam tests platform fluency, not one product line. Understanding that 'ServiceNow' is a platform with applications built on top of it (rather than a single fixed application) explains why skills like ACLs, lists, and Update Sets are consistent everywhere in the product.",
    coreConcepts:
      "- One codebase, one data model, many applications\n- Applications = tables + logic + UI built on the platform\n- Platform capabilities: workflow, integration, AI, security, reporting\n- Releases (e.g. Washington DC, Xanadu) ship platform-wide upgrades twice a year",
    terminology:
      "- **Now Platform** — the underlying technology stack\n- **Application** — a packaged set of tables, logic, and UI for a business process\n- **Instance** — a single deployed copy of the platform for a customer\n- **Scoped application** — an app whose tables/scripts are isolated in their own namespace",
    howItWorks:
      "Every ServiceNow instance is built from the same platform primitives: tables (data), Business Rules/Flows (server logic), Client Scripts/UI Policies (client logic), and ACLs (security). Applications are essentially curated bundles of these primitives shipped as plugins or store apps.",
    adminTasks:
      "- Orient new users/admins to where functionality lives\n- Identify which application owns a given table or process\n- Distinguish platform-level configuration from application-level configuration",
    examFocus:
      "Expect high-level conceptual questions: what the platform is, how applications relate to it, and recognizing platform vs. application-specific terminology.",
    commonTraps:
      "Don't confuse 'ServiceNow' (the company/product) with 'the Now Platform' (the underlying technology) — exam wording is often precise about this distinction.",
    exampleScenario:
      "A new administrator asks why an ACL they wrote for one application also affects list views in a completely different application. Because ACLs are a platform-wide security capability, not an application feature, they apply anywhere the underlying table is accessed.",
  },

  "servicenow-instance": {
    overview:
      "A ServiceNow instance is a single, isolated deployment of the platform — its own database, its own configuration, its own URL. Organizations typically run multiple instances (e.g. development, test, production) to safely build and promote changes.",
    whyItMatters:
      "Understanding instance architecture explains why Update Sets exist, why testing happens in non-production instances first, and what an administrator can and cannot control at the infrastructure layer (a recurring Shared Responsibility Model theme).",
    coreConcepts:
      "- Each instance is logically and physically isolated from other customers' instances\n- Multi-instance strategy: typically dev → test → production\n- Core instance architecture is managed by ServiceNow; customers configure on top of it\n- The MID Server is an optional, customer-installed component for connecting to on-premise/private networks — it is not part of core instance architecture",
    terminology:
      "- **Instance** — one deployed copy of the platform\n- **Sub-production instance** — dev/test instance used before promoting to production\n- **MID Server** — customer-installed Java agent for internal network access\n- **Instance cloning** — copying data/config from one instance to another",
    howItWorks:
      "ServiceNow hosts and manages the core instance infrastructure (application servers, database, load balancing) as part of its side of the Shared Responsibility Model. Administrators manage configuration, data, users, and integrations within that instance.",
    adminTasks:
      "- Request instance clones to refresh a sub-production instance\n- Understand what is/isn't customer-managed at the infrastructure level\n- Plan a promotion path for configuration changes across instances",
    examFocus:
      "Questions often test which components are 'core' platform infrastructure (e.g. load balancer) versus optional customer-managed components (e.g. MID Server).",
    commonTraps:
      "The MID Server is a very commonly mistested 'trap' answer — it feels like core infrastructure but it is an optional, customer-deployed integration component, not part of the base instance architecture.",
    exampleScenario:
      "An administrator needs to connect ServiceNow Discovery to internal, non-internet-facing servers. They install a MID Server inside the corporate network to bridge that connection — the MID Server is not something ServiceNow provisions automatically with the instance.",
  },

  "unified-navigation": {
    overview:
      "Next Experience Unified Navigation is the modern ServiceNow UI shell: a persistent left-hand navigation with the All menu, Favorites, History, and global search, replacing the older frame-based UI16 navigator for most users.",
    whyItMatters:
      "Nearly every task in the CSA exam assumes familiarity with where things live in this navigation shell — the All menu, Favorites, and search are the primary way admins and end users find modules and records.",
    coreConcepts:
      "- **All menu** — full application/module navigator, replaces the left frame\n- **Favorites** — user-saved shortcuts to modules, lists, or records\n- **History** — recently visited records/pages\n- **Global search** — search across tables, knowledge, catalog, and more from one box",
    terminology:
      "- **All menu** — lists every application/module the user can access\n- **Favorites menu** — saved shortcuts only\n- **Globe icon** — current application scope indicator, not a navigation list\n- **Unified Navigation** — the Next Experience navigation framework",
    howItWorks:
      "Unified Navigation renders based on the user's assigned roles and modules — the All menu only shows what a user is entitled to see, keeping navigation both personalized and access-controlled.",
    adminTasks:
      "- Organize application menus and modules for findability\n- Set up and audit Favorites/homepage defaults for new users\n- Configure global search sources",
    examFocus:
      "Know the distinct purpose of All menu vs. Favorites vs. Globe icon vs. Global search — these are frequently used as distractors against one another.",
    commonTraps:
      "The Globe icon indicates/switches application scope — it is not a list of modules or favorites, a common exam distractor.",
    exampleScenario:
      "A user wants one-click access to the Incident list they open every day. They pin it to Favorites rather than searching the All menu each time.",
  },

  "installing-applications-plugins": {
    overview:
      "Functionality is added to an instance primarily through plugins (ServiceNow-authored features toggled on within an instance) and the ServiceNow Store (a marketplace of certified applications, some free, some paid).",
    whyItMatters:
      "Knowing how new capability legitimately enters an instance — and who is allowed to enable it — is core CSA administrator knowledge and a frequent exam topic.",
    coreConcepts:
      "- **Plugins** — modular platform features (e.g. Service Catalog, Performance Analytics) turned on per instance\n- **ServiceNow Store** — marketplace for certified apps/integrations, some built by ServiceNow, some by partners\n- Plugins not visible in the Application Manager may require activation through **Now Support**, since some plugins are not self-service\n- Application scoping isolates store/custom apps from global scope",
    terminology:
      "- **Plugin** — a packaged, toggleable platform feature\n- **Now Support** — ServiceNow's official customer support channel/portal\n- **Application Manager** — module for installing/managing store apps\n- **Scoped application** — an app whose artifacts live in an isolated namespace",
    howItWorks:
      "Most plugins can be activated by an administrator directly from the Plugins module. Some plugins are restricted and only ServiceNow personnel can enable them — in that case, the correct path is requesting activation through Now Support, not attempting a workaround like cloning or exporting an update set.",
    adminTasks:
      "- Activate an available plugin from the Plugins module\n- File a Now Support request for a restricted plugin\n- Install and configure a Store application",
    examFocus:
      "A very common CSA scenario: 'a plugin does not appear in the Application Manager — what does the admin do?' The correct answer is requesting activation via Now Support, not self-activating it.",
    commonTraps:
      "Update Sets move configuration between instances a customer already owns — they cannot 'download' or unlock a plugin that isn't available on the instance. Cloning also does not grant new plugin access.",
    exampleScenario:
      "An administrator wants to enable a plugin required for a new project, but it doesn't appear anywhere in Application Manager or the Plugins list. They submit a request through Now Support, since the plugin's availability is controlled by ServiceNow.",
  },

  "personalizing-the-instance": {
    overview:
      "Personalization covers user-level customization — themes, list preferences, homepage layout — versus system-wide customization an administrator makes for all users, such as branding or default form layouts.",
    whyItMatters:
      "The exam distinguishes between what an end user can personalize for themselves and what only an administrator can configure globally.",
    coreConcepts:
      "- **User-level personalization** — themes, list column choices, personal dashboards\n- **System-level customization** — branding, default views, global UI policies\n- Personalization settings generally do not require elevated roles; system customization does",
    terminology:
      "- **System Settings** — instance-wide configuration\n- **User Preferences** — per-user saved settings\n- **Theme** — visual styling applied at user or system level",
    howItWorks:
      "Most personalization is stored per-user (sys_user_preference records) and does not affect other users, while system customization changes shared configuration records that apply instance-wide.",
    adminTasks:
      "- Set instance-wide branding/theme defaults\n- Reset a user's personalization if it causes display issues\n- Balance personalization flexibility against consistent UX for all users",
    examFocus:
      "Expect questions distinguishing a personal preference change from an administrator-level configuration change.",
    commonTraps:
      "Don't assume every visual change on a form is a UI Policy or Business Rule — some are simply personal list/format preferences with no server-side logic involved.",
    exampleScenario:
      "A user switches their personal theme to dark mode; this has no effect on any other user's experience, unlike a system-wide branding change an admin would make.",
  },

  "common-user-interfaces": {
    overview:
      "ServiceNow exposes several distinct interfaces for different audiences: the standard UI for administrators/fulfillers, Workspaces (agent-focused, configurable UI Builder or Agent Workspace experiences), and Service Portal/Employee Center for self-service end users.",
    whyItMatters:
      "CSA administrators must know which interface serves which audience and how to point users to the right one.",
    coreConcepts:
      "- **Standard UI (Next Experience)** — full administrative interface\n- **Workspaces** — focused, role-specific interfaces (e.g. Agent Workspace) often built with UI Builder\n- **Service Portal / Employee Center** — self-service portals for end users to submit requests and browse knowledge/catalog",
    terminology:
      "- **UI Builder** — low-code tool for building Workspaces and portal pages\n- **Agent Workspace** — fulfiller-focused workspace, commonly used for ITSM\n- **Employee Center** — modern self-service portal for employees",
    howItWorks:
      "Each interface reads from the same underlying tables but presents different navigation, layout, and available actions suited to its audience — fulfillers need list/queue-oriented views, while requesters need a simplified, catalog/knowledge-oriented experience.",
    adminTasks:
      "- Configure and assign the right workspace/portal to the right user population\n- Customize Employee Center branding and catalog visibility\n- Build/update workspace experiences with UI Builder",
    examFocus:
      "Know the intended audience of each interface — standard UI/Workspaces for fulfillers and admins, portals for requesters/end users.",
    commonTraps:
      "Employee Center and Service Portal are both end-user self-service surfaces — don't confuse them with Agent Workspace, which is built for fulfillers working queues of tasks.",
    exampleScenario:
      "An HR team wants employees to submit requests without seeing internal ticket fields. Employees are directed to Employee Center, while HR fulfillers work the resulting cases in Agent Workspace.",
  },

  "lists-filters-tags": {
    overview:
      "Lists display multiple records from a table in rows and columns. Filters narrow which records are shown using conditions, and Tags let users apply free-form, personal or shared labels to records across tables.",
    whyItMatters:
      "Lists are the most common way administrators and users interact with data at scale, and filter/tag literacy is assumed throughout the exam's data-handling questions.",
    coreConcepts:
      "- **List** — tabular, multi-record view of a table\n- **Filter** — one or more conditions narrowing the list (AND/OR logic, condition builder)\n- **Tag** — a label a user attaches to records, independent of the table's schema, for personal or shared organization\n- List anatomy: column headers, breadcrumbs (active filter), list controls, context menus",
    terminology:
      "- **Condition builder** — UI for constructing filter conditions\n- **Breadcrumbs** — the summary of the currently applied filter shown above a list\n- **Personalize list** — choosing which columns display\n- **List v3 / List v2** — different list rendering engines used across the UI",
    howItWorks:
      "A list query is built from the table plus any applied filter conditions; breadcrumbs summarize that query in plain language. Right-clicking column headers or the list header exposes configuration such as sorting, grouping, and column choices. Tags are stored independently and can span unrelated tables.",
    adminTasks:
      "- Build and save filters for recurring reporting needs\n- Configure default list columns for a role or view\n- Apply/manage tags for cross-table personal organization",
    examFocus:
      "Know how to identify list vs. form vs. related list, and that tags are a general cross-table labeling mechanism, not tied to one table's schema.",
    commonTraps:
      "A related list (child records shown on a form) is not the same as a standalone list view — the exam distinguishes them by context (on a form vs. a full-page list).",
    exampleScenario:
      "A user wants to mark a set of unrelated records (an incident, a CI, and a knowledge article) for later follow-up without changing any of their fields — tags let them label all three without altering the underlying data.",
  },

  forms: {
    overview:
      "Forms present a single record's fields for viewing and editing. Form configuration covers layout (sections, related lists), behavior (mandatory/read-only/visible), templates for pre-filling values, and saving options such as Save, Save and Exit, Insert, or Insert and Stay.",
    whyItMatters:
      "Form behavior questions are extremely common on the CSA exam because forms are where UI Policies, Client Scripts, Business Rules, and Data Policies all visibly converge.",
    coreConcepts:
      "- **Form anatomy** — header, fields/sections, related lists, activity stream, context menu\n- **Form configuration** — Form Layout, Form Design, related list configuration\n- **Form templates** — predefined field values a user can apply to a new record\n- **Saving options** — Save, Save and Exit, Save and New, Insert, Insert and Stay, Update and Stay\n- **Advanced form configuration** — annotations, embedded lists, split forms",
    terminology:
      "- **Template** — a saved set of field values applied when creating/updating a record\n- **Related list** — child records shown at the bottom of a parent form\n- **Activity stream** — chronological comments/work notes/history on a form\n- **Form context menu** — right-click menu exposing Form Layout, Related Lists config, etc.",
    howItWorks:
      "A form is generated from the table's dictionary definition and any active View; UI Policies and Client Scripts then adjust field state client-side, while Business Rules and Data Policies enforce rules server-side. Templates simply pre-populate values a user can still edit before saving.",
    adminTasks:
      "- Build a form template for a frequently created record type\n- Configure which related lists appear on a form\n- Design a form layout/view for a specific role or department",
    examFocus:
      "Know the difference between form templates (predefined values, editable) and other mandatory/enforcement mechanisms (UI Policy, Data Policy) — these are frequently contrasted.",
    commonTraps:
      "A template pre-fills values; it does not enforce or restrict anything after the fact — that distinction is a common trap versus UI Policy/Data Policy questions.",
    exampleScenario:
      "A service desk agent frequently creates the same type of recurring incident. Instead of retyping fields, they apply a saved template that pre-fills category, assignment group, and short description, then adjust details before saving.",
  },

  "task-management-vtb": {
    overview:
      "Visual Task Boards (VTBs) give a Kanban-style, drag-and-drop view of task records (e.g., sprint backlogs, incident queues) organized into user-defined lanes, layered on top of standard task management tables.",
    whyItMatters:
      "VTBs are a distinctive, exam-relevant feature for visual work management that complements (not replaces) list-based task management.",
    coreConcepts:
      "- **Visual Task Board** — a board with lanes representing states or categories\n- **Card** — a visual representation of a task record on the board\n- Boards can be personal or shared with a team\n- Moving a card between lanes can update the underlying record's field value",
    terminology:
      "- **Lane** — a column on the board representing a value/state\n- **Card** — one record shown as a draggable tile\n- **Quick Info** — the summary shown when hovering/expanding a card",
    howItWorks:
      "A VTB is bound to a table and a grouping field; each lane corresponds to a value of that field. Dragging a card to a new lane updates the underlying task record, giving a visual alternative to editing the field directly on a form or list.",
    adminTasks:
      "- Create a Visual Task Board for a team's workflow\n- Define lanes matching a task's state/category values\n- Share a board with the right group",
    examFocus:
      "Recognize VTBs as a visual, drag-and-drop layer over task tables — distinct from Kanban-adjacent tools outside the platform, and from list views.",
    commonTraps:
      "A VTB is not a separate data store — moving a card changes the same underlying record a list or form would show; it's a different view, not different data.",
    exampleScenario:
      "A team wants a Scrum-style board to track story status. They configure a VTB on the Story table with lanes for Backlog, In Progress, and Done, and drag cards as work progresses.",
  },

  "visualizations-dashboards-pa": {
    overview:
      "Reports summarize table data as charts/tables from a single source. Dashboards combine multiple reports and visualizations in one place. Performance Analytics goes further, tracking a specific metric over time via historical snapshots (Indicators) to show trends, not just a point-in-time count.",
    whyItMatters:
      "The exam expects administrators to choose the right tool: a one-off report, a multi-report dashboard, or Performance Analytics for trend analysis over time.",
    coreConcepts:
      "- **Report** — single visualization built from one table/query\n- **Dashboard** — a canvas combining multiple reports/widgets in one place\n- **Performance Analytics (PA)** — trend analysis using scored, time-based Indicators\n- **Indicator** — a PA metric tracked and snapshotted over time",
    terminology:
      "- **Widget** — an individual report/visualization placed on a dashboard\n- **Indicator** — a defined, trackable PA metric\n- **Breakdown** — a PA dimension used to segment an indicator (e.g. by group)\n- **Data Visualization** — chart-building tool for ad hoc, code-free visual analysis",
    howItWorks:
      "Reports query a table directly and render current-state data. Dashboards aggregate several reports for a combined view. PA periodically snapshots Indicator scores so historical trend lines can be drawn — something a standard report cannot do, since a report only reflects current data.",
    adminTasks:
      "- Build and share a report from a filtered list\n- Assemble a dashboard combining several team reports\n- Define a PA Indicator to track a KPI's trend over time",
    examFocus:
      "The signature distinction: 'tracks a metric over time using historical snapshots' = Performance Analytics Indicator, not a standard Dashboard or Report.",
    commonTraps:
      "A Dashboard displaying several reports is not the same as Performance Analytics tracking trend/historical data — dashboards are a layout/aggregation tool, not a time-series engine.",
    exampleScenario:
      "Leadership wants to see how average incident resolution time has changed over the last 12 months, not just today's snapshot. That trend requirement points to a Performance Analytics Indicator, not a standard report.",
  },

  notifications: {
    overview:
      "Notifications are the platform's framework for alerting users of events (record created/updated, SLA breach approaching, etc.) via email, push, or other configured channels, driven by triggers and conditions similar to Business Rules.",
    whyItMatters:
      "Notifications are how automated processes communicate with humans — a foundational self-service and ITSM concept tested throughout the exam.",
    coreConcepts:
      "- **Notification** — a configured message triggered by an event or record change\n- **Trigger** — what causes a notification to fire (record event, inserted/updated conditions)\n- **Subscription** — allowing users to opt in/out of specific notifications\n- **Email/Push/Notification devices** — the delivery channel(s)",
    terminology:
      "- **Notification record** (sysevent_email_action) — defines when/what/to whom\n- **Event** — a system event a notification can listen for\n- **Weekly Digest / Notification Preferences** — user-level delivery controls",
    howItWorks:
      "Notifications are configured against a table and fire when their trigger conditions are met (either directly on record insert/update, or via a fired system Event), then render a message template and deliver it through the configured channel(s).",
    adminTasks:
      "- Create a notification for a new state transition\n- Configure who receives a notification (fields, groups, roles)\n- Debug why a notification did or didn't fire",
    examFocus:
      "Know that notifications are not the same mechanism as Reports/Dashboards (visualization) or system logging (Events) — they specifically deliver messages to users.",
    commonTraps:
      "Sending a report or a system log entry is not the same as sending a notification — the exam distinguishes 'informing a user' (notifications) from 'recording/analyzing data' (reports, logs).",
    exampleScenario:
      "An administrator wants assigned agents emailed whenever a high-priority incident is created. They configure a notification triggered on insert with a condition for priority = 1.",
  },

  "knowledge-management": {
    overview:
      "Knowledge Management lets organizations author, organize, and publish articles for self-service. Access to a knowledge base is governed by User Criteria (who can view/contribute), and articles move through a defined workflow (draft → review → published → retired).",
    whyItMatters:
      "Deflecting tickets through self-service knowledge is a core value proposition of the platform and a heavily weighted exam topic under Self-Service and Automation.",
    coreConcepts:
      "- **Knowledge Base** — a container of articles with its own access rules\n- **User Criteria** — defines who can view or contribute to a knowledge base\n- **Article workflow** — Draft, Review, Published, Retired states\n- **Knowledge roles** — e.g. knowledge, knowledge_admin, for authoring and administration",
    terminology:
      "- **User Criteria** — reusable rule defining a user population's access\n- **knowledge_admin** — role that manages knowledge base configuration\n- **Article template** — reusable structure for consistent articles\n- **Feedback/rating** — end-user input on article usefulness",
    howItWorks:
      "Access to a knowledge base (not individual articles) is controlled by attaching Can Read/Can Contribute User Criteria records to the base, which the platform evaluates for each user, rather than per-article ACLs.",
    adminTasks:
      "- Create a knowledge base and assign User Criteria for read/contribute access\n- Manage the article approval workflow\n- Assign the knowledge_admin role to base administrators",
    examFocus:
      "Know that User Criteria — not Business Rules, Client Scripts, or UI Policies — is the mechanism controlling knowledge base access.",
    commonTraps:
      "UI Policies/Business Rules/Client Scripts govern form and field behavior, not who can see a knowledge base — a frequent exam distractor pattern.",
    exampleScenario:
      "HR wants only employees in the 'Managers' group to view a sensitive knowledge base. The admin creates a Can Read User Criteria scoped to that group and attaches it to the base.",
  },

  "service-catalog": {
    overview:
      "The Service Catalog is the storefront for requestable items — hardware, software, access requests, HR services. Catalog items are built and organized via Maintain Items and Catalog Builder; fulfillment flows through Requests (REQ), Requested Items (RITM), and Catalog Tasks (SCTASK).",
    whyItMatters:
      "Service Catalog fulfillment is one of the most heavily tested Self-Service topics, especially the REQ/RITM/SCTASK relationship and catalog authoring tools.",
    coreConcepts:
      "- **Maintain Items** — module for creating/editing catalog items\n- **Catalog Builder** — guided, modern interface for building catalog items and Record Producers\n- **Variable / Variable Set** — reusable input fields on a catalog item\n- **REQ → RITM → SCTASK** — request hierarchy: one Request can contain multiple Requested Items, each of which can spawn one or more fulfillment tasks",
    terminology:
      "- **Record Producer** — a catalog-style form that creates a record on a different table (e.g. an incident) rather than a standard request\n- **Variable Set** — a reusable group of variables shared across catalog items\n- **User Criteria** — controls catalog item visibility\n- **Catalog Client Script** — client-side scripting scoped to catalog forms",
    howItWorks:
      "A user submits a catalog item, generating a REQ (the overall order) containing one RITM per item ordered; each RITM can generate one or more SCTASKs assigned to fulfillment groups, tracked independently through to closure.",
    adminTasks:
      "- Build a catalog item with Catalog Builder or Maintain Items\n- Configure variable sets shared across multiple items\n- Set User Criteria to control who can order an item",
    examFocus:
      "Be fluent in REQ vs. RITM vs. SCTASK and know Catalog Builder as the guided-experience tool for creating catalog items and Record Producers.",
    commonTraps:
      "A Record Producer is still a catalog interface, but it creates a record on a target table (like Incident) instead of a standard request — don't assume every catalog submission becomes a REQ/RITM.",
    exampleScenario:
      "An employee orders a laptop and a monitor in one cart checkout. This creates one REQ with two RITMs (one per item), and each RITM spawns SCTASKs for procurement and IT setup.",
  },

  "workflow-studio": {
    overview:
      "Workflow Studio is the unified authoring environment for Flow Designer (no-code/low-code automation), Subflows, and Actions — the modern replacement for the legacy graphical Workflow editor.",
    whyItMatters:
      "Flow Designer is ServiceNow's primary current automation tool and a major Self-Service/Automation exam topic, including its core building blocks and how data passes between steps.",
    coreConcepts:
      "- **Flow** — an automated process built from triggers and actions\n- **Trigger** — what starts a flow (record created/updated, schedule, etc.)\n- **Action** — a reusable unit of work a flow performs (e.g. Create Record, Ask for Approval)\n- **Subflow** — a reusable flow called by other flows\n- **Data Pill** — a reference that passes output data from one action into a later action's input",
    terminology:
      "- **Core Actions** — built-in actions like Create Record and Ask for Approval\n- **Data Pill** — mechanism for passing information between steps\n- **Trigger condition** — criteria that must be met for the flow to start",
    howItWorks:
      "A flow starts on its trigger, then executes actions in sequence; each action's outputs become Data Pills available to later steps, letting later actions reference earlier results without custom scripting.",
    adminTasks:
      "- Build a flow with a record trigger and core actions\n- Pass data between actions using Data Pills\n- Convert a repeated flow segment into a reusable Subflow",
    examFocus:
      "Know the platform's core Flow Designer actions (e.g. Create Record, Ask for Approval) versus adjacent-but-different capabilities like Notifications or Reports, and understand Data Pills as the cross-action data mechanism.",
    commonTraps:
      "Sending a report or notification is not itself a 'core action' category the same way Create Record/Ask for Approval are — don't lump reporting/notification framework concepts into Flow Designer's core action set.",
    exampleScenario:
      "A flow creates a change request, then needs to notify the requester using the new record's number. The Data Pill from the Create Record action carries that number into the later notification step.",
  },

  "virtual-agent": {
    overview:
      "Virtual Agent gives employees a conversational, chat-based interface (often paired with NLU) to get answers and complete simple tasks — password resets, status checks — without opening a form or ticket, and can escalate to a live agent when needed.",
    whyItMatters:
      "Virtual Agent represents ServiceNow's conversational self-service layer and is explicitly called out in the Self-Service and Automation domain.",
    coreConcepts:
      "- **Virtual Agent** — chatbot framework built on conversational topics\n- **Topic** — a defined conversation flow for a specific intent\n- **NLU (Natural Language Understanding)** — model interpreting free-text user input to match a topic\n- Live agent handoff for cases the bot can't resolve",
    terminology:
      "- **Conversational interface** — chat-based interaction pattern\n- **Topic Block** — a reusable segment of a Virtual Agent conversation\n- **NLU model** — the intent-classification model behind topic matching",
    howItWorks:
      "A user's message is matched (via NLU or explicit topic selection) to a Virtual Agent Topic, which then runs through defined blocks — asking questions, calling flows/scripts, or handing off to a live agent — to resolve the request conversationally.",
    adminTasks:
      "- Build a Virtual Agent Topic for a common request type\n- Configure NLU training phrases for accurate topic matching\n- Set up live agent escalation paths",
    examFocus:
      "Recognize Virtual Agent as the conversational/chat self-service capability, distinct from the Service Portal, Catalog, or Notifications.",
    commonTraps:
      "A Record Producer or catalog item is still a form-based interaction; Virtual Agent's defining trait is the conversational chat interface, which the exam uses to distinguish it from other self-service tools.",
    exampleScenario:
      "An employee asks a chatbot 'what's the status of my laptop request?' Virtual Agent matches the intent to a topic that looks up their open RITM and replies with its state — no form navigation required.",
  },

  "data-schema": {
    overview:
      "ServiceNow stores all data in tables made of fields (columns), defined by dictionary entries. Tables can extend other tables (table inheritance), most notably the Task table, which many ITSM/CSM/HR tables extend to share common fields and behavior.",
    whyItMatters:
      "Understanding table extension explains why so many process tables (Incident, Problem, Change, Case) share fields like State, Priority, and Work notes — they all extend Task.",
    coreConcepts:
      "- **Table** — stores records; made of fields defined in the dictionary\n- **Table extension** — a child table inherits all parent table fields plus its own\n- **Task table** — the common parent for most process/ticket tables, providing fields like State, Work notes, Assignment group\n- **Dictionary** — metadata describing every field's type/behavior",
    terminology:
      "- **Extends** — the parent-child table relationship\n- **sys_dictionary** — table storing field definitions\n- **Base table** — a table with no parent (or the root of an extension hierarchy)",
    howItWorks:
      "When a table extends another, its records physically/logically inherit the parent's fields; a query against the parent table can return records from all its child tables (polymorphism), which is why generic Task-level reporting works across Incident, Change, etc.",
    adminTasks:
      "- Identify which base table a custom table should extend\n- Add custom fields without duplicating inherited ones\n- Understand which fields are inherited vs. table-specific",
    examFocus:
      "Know that fields like State and Work notes come from the Task table (inherited), while things like Knowledge Base or Workflow-specific fields belong to entirely different tables, not Task.",
    commonTraps:
      "Don't assume every common-sounding field is inherited from Task — Knowledge Article-specific fields (e.g. Workflow state on kb_knowledge) are not Task fields, even though they sound similar.",
    exampleScenario:
      "A developer creates a new 'Facilities Request' table extending Task. It automatically gains State, Priority, and Work notes fields without redefining them.",
  },

  "access-control": {
    overview:
      "Access Control Lists (ACLs) are the platform's core security mechanism, governing create/read/write/delete access at the table and field level, using required roles, conditions, and/or scripts. Roles are how permissions are granted to users, usually via group membership.",
    whyItMatters:
      "Security is the single largest CSA domain, and ACL evaluation is consistently one of the most heavily and precisely tested topics on the exam.",
    coreConcepts:
      "- **ACL operations** — Create, Read, Write (update), Delete\n- **Table-level vs. field-level ACLs** — govern the whole record vs. a specific field\n- **Required fields on an ACL** — Type (table/record/field) and Name (which table/field it governs) are mandatory; Advanced script and 'Applies to' are optional refinements\n- **ACL evaluation order** — table (most specific → most general) first, then field (most specific → most general)\n- Failing any required ACL denies access to that operation on that record/field",
    terminology:
      "- **security_admin** — role required to edit/create most ACLs\n- **Condition** — a filter-style requirement an ACL can add\n- **Script** — custom server-side logic an ACL can require to pass\n- **Role** — a named permission grouping assigned to users/groups",
    howItWorks:
      "For a given operation, ServiceNow evaluates all matching ACLs from most specific table match to most general, then does the same for field-level ACLs; a user must pass every applicable ACL (role AND condition AND script, where present) to be granted access — failing any check denies that operation.",
    adminTasks:
      "- Write a table or field ACL restricting an operation to a role\n- Add a condition or script to an ACL for finer-grained control\n- Diagnose why a user can't see/edit a record using ACL evaluation order",
    examFocus:
      "Expect precise questions on: which ACL fields are mandatory (Type, Name), evaluation order (table before field, specific before general), and what happens on failure (access denied, not a warning).",
    commonTraps:
      "'Advanced' (script) and 'Applies to' are optional ACL refinements, not mandatory fields — a common exam distractor pairs them with Type/Name as if all four were required.",
    exampleScenario:
      "A user without the required role tries to read a record. Even though a broader table-level ACL might allow it, a more specific field-level Read ACL requiring 'security_admin' denies access to that field — access is denied, not merely hidden with a warning.",
  },

  "importing-data": {
    overview:
      "Import Sets bring external data (CSV, XML, JDBC, web services, etc.) into staging tables, then Transform Maps move that data into target tables using field mappings, with Coalesce fields determining whether a row updates an existing record or inserts a new one.",
    whyItMatters:
      "Data migration and integration are explicitly weighted exam domains, and coalesce/transform-map mechanics are among the most precisely tested concepts.",
    coreConcepts:
      "- **Import Set** — staging table holding raw imported data (commonly from CSV/XML)\n- **Transform Map** — defines field mapping from the import set to a target table\n- **Coalesce** — marks a field as the match key: if a target record matches on that field, the transform updates it; otherwise it inserts a new record\n- **Field mapping** — associates a source column to a target field",
    terminology:
      "- **Staging table** — the intermediate table an import set loads into\n- **Coalesce field** — the field used to detect an existing match\n- **Transform script** — optional script run during transform (onBefore, onAfter, etc.)\n- **Data source** — defines where/how the import set gets its data",
    howItWorks:
      "Data first lands in a staging (import set) table exactly as provided; running the Transform Map then maps each staged field to a target field, and — for any field flagged Coalesce — checks whether a target record already matches on that value: match found → update, no match → insert a new record.",
    adminTasks:
      "- Configure a data source and import set table for a CSV feed\n- Build a transform map with correct field mappings\n- Mark the correct field(s) as Coalesce for accurate update-vs-insert behavior",
    examFocus:
      "Know the exact definition of Coalesce (decides update vs. insert) and the accepted import file formats (commonly XML and CSV) versus unsupported formats used as distractors.",
    commonTraps:
      "Coalesce is not about auto-mapping, read-only fields, or encryption — those are separate, unrelated transform/field concepts frequently used as wrong answers.",
    exampleScenario:
      "A nightly CSV import of employee records uses Employee ID as the coalesce field. When a row's Employee ID matches an existing user record, that record is updated; a new Employee ID creates a new user record instead.",
  },

  cmdb: {
    overview:
      "The Configuration Management Database (CMDB) stores Configuration Items (CIs) — servers, applications, services — and the relationships between them, giving IT a single source of truth about what exists in the environment and how it's connected.",
    whyItMatters:
      "CMDB underpins Change, Incident impact analysis, and service mapping — a foundational, heavily weighted Database Management topic.",
    coreConcepts:
      "- **Configuration Item (CI)** — a managed, trackable entity (server, application, service)\n- **CI Class** — the CMDB table/type a CI belongs to (cmdb_ci_server, etc.), forming a class hierarchy\n- **Relationship** — a typed connection between two CIs (e.g. 'runs on', 'depends on')\n- **CMDB Health** — data quality dashboard for completeness/correctness/compliance of CI data",
    terminology:
      "- **cmdb_ci** — the base Configuration Item table\n- **Relationship type** — defines the semantics of a CI-to-CI link\n- **Discovery** — automated tool that populates/updates CMDB data\n- **CMDB Health** — measures CI data quality, not the broader governance framework",
    howItWorks:
      "CIs are created/updated manually, via Discovery, or via Service Mapping, and are connected through relationship records; this graph of CIs and relationships lets the platform trace dependencies (e.g. which business service an affected server supports).",
    adminTasks:
      "- Review CMDB Health scores for data quality gaps\n- Define/adjust CI relationship types for accurate dependency mapping\n- Reconcile duplicate CIs found through Discovery or imports",
    examFocus:
      "Distinguish CMDB (the data store of CIs/relationships) from CSDM (the framework/blueprint for how that data should be organized) — a frequent pairing in exam questions.",
    commonTraps:
      "CMDB stores the data; it is not itself the governance blueprint — that's CSDM. Don't answer 'CMDB' when a question is actually describing organizational structure/blueprint.",
    exampleScenario:
      "During an incident, an analyst uses CMDB relationships to trace that a failing database server supports three downstream business applications, helping prioritize the response.",
  },

  csdm: {
    overview:
      "The Common Service Data Model (CSDM) is ServiceNow's prescriptive framework for organizing CMDB data into consistent domain layers — Foundation, Design, Build, Manage, Consume, Sell (as applicable) — so services can be modeled consistently across the enterprise.",
    whyItMatters:
      "CSDM appears throughout the Database Management domain as the 'why/how' behind good CMDB structure, and its layer definitions are a common precise-recall exam topic.",
    coreConcepts:
      "- **CSDM** — the blueprint/framework for structuring service data, layered on top of CMDB\n- **Foundation layer** — core CMDB elements: locations, users, groups, base infrastructure\n- **Design layer** — architecture/logical models of a service before build\n- **Build layer** — technical, deployed components (applications, servers)\n- **Consume layer** — customer/user-facing service offerings that can be requested or subscribed to",
    terminology:
      "- **Domain layer** — one of CSDM's structural categories (Foundation, Design, Build, Consume, etc.)\n- **Service Offering** — a specific, consumable variant of a business service\n- **Application Service** — a technical service composed of CIs, mapped to business services",
    howItWorks:
      "CSDM prescribes which CI classes and relationships belong in each layer and how they connect vertically (e.g. a Business Application in Build supports an Application Service, which supports a Service Offering in Consume) — giving a consistent path from technical infrastructure to something a customer can request.",
    adminTasks:
      "- Map existing CMDB data into the appropriate CSDM domain layer\n- Align Service Offerings/Business Services with CSDM guidance\n- Use CSDM layering to plan a CMDB remediation project",
    examFocus:
      "Memorize which CSDM layer contains customer-facing, requestable offerings (Consume) versus foundational infrastructure (Foundation) versus architecture (Design) versus built technical components (Build).",
    commonTraps:
      "Don't confuse Foundation (core infrastructure/location/user data) with Consume (customer-facing offerings) — these are commonly swapped as distractors.",
    exampleScenario:
      "A company wants employees to be able to request 'Email Service — Standard' from the catalog. That customer-facing offering belongs in the CSDM Consume layer, distinct from the underlying Exchange servers modeled in Build.",
  },

  "security-center": {
    overview:
      "Security Center is a dashboard-driven module surfacing an instance's security posture: vulnerabilities, configuration compliance, and, notably, Customer Actions — security risks that remain unresolved after an upgrade and need administrator attention.",
    whyItMatters:
      "Security Center operationalizes the Shared Responsibility Model by showing administrators exactly what is theirs to remediate, making it a natural and frequent exam pairing with that topic.",
    coreConcepts:
      "- **Security Center** — centralized dashboard of security posture and risk indicators\n- **Customer Actions** — specific security risks/remediations that remain unresolved after an upgrade, requiring customer follow-up\n- **Configuration Compliance** — checks instance settings against security best practices\n- **Vulnerability Response integration** — surfaces known vulnerabilities affecting the instance",
    terminology:
      "- **Customer Action** — an outstanding, customer-owned remediation item\n- **Security Score** — an aggregate posture indicator\n- **Hardening** — configuration changes that reduce risk",
    howItWorks:
      "Security Center aggregates findings (post-upgrade risks, misconfigurations, known vulnerabilities) into a single view, and specifically tracks Customer Actions so administrators have a clear, prioritized remediation list rather than needing to hunt through release notes.",
    adminTasks:
      "- Review and remediate outstanding Customer Actions after an upgrade\n- Monitor configuration compliance scores\n- Use Security Center findings to prioritize hardening work",
    examFocus:
      "Know that Customer Actions specifically address unresolved security risks after an upgrade — not general customizations review, not automatic system fixes.",
    commonTraps:
      "Don't confuse Customer Actions (security risk remediation) with Upgrade-related customization review tools used for functional regression, or with 'Security Tasks' from a different context — the exam wording is precise about 'security risks... after an upgrade'.",
    exampleScenario:
      "After a semi-annual upgrade, Security Center flags a Customer Action indicating a new ACL should be reviewed given a platform default change. The administrator addresses it directly from Security Center.",
  },

  "shared-responsibility-model": {
    overview:
      "The Shared Responsibility Model clarifies who is accountable for what across the ServiceNow relationship: ServiceNow secures and operates the core platform/infrastructure, while customers are responsible for their data, configuration, users, and integrations — with some responsibilities (like email security or backups) explicitly shared.",
    whyItMatters:
      "This model is the conceptual backbone connecting several Database Management and Security topics (Security Center, backups, email security) and is directly named in the exam blueprint.",
    coreConcepts:
      "- **Goal**: clarify accountability and uphold security and privacy across the ServiceNow/customer relationship\n- ServiceNow's side: core platform security, infrastructure, uptime\n- Customer's side: data, configuration, access control, user management\n- **Shared** responsibilities: some areas (e.g. email security, backup/restoration processes) explicitly involve both parties",
    terminology:
      "- **Shared Responsibility Model** — the accountability framework itself\n- **Customer-managed** — responsibilities the customer owns\n- **ServiceNow-managed** — responsibilities ServiceNow owns\n- **Colocation facility / Cloud service provider** — infrastructure-layer parties, distinct from ServiceNow and the customer",
    howItWorks:
      "Each capability area (backups, email security, ACL configuration, platform patching, etc.) is mapped to whoever is actually able to control it — ServiceNow controls platform-level infrastructure and patching, while customers control their own configuration, ACLs, and data governance; some processes require coordinated action from both.",
    adminTasks:
      "- Identify which security responsibilities require customer action vs. ServiceNow action\n- Use Security Center Customer Actions to fulfill the customer's share of responsibility\n- Educate stakeholders on what ServiceNow does and does not manage",
    examFocus:
      "Its stated goal ('clarify accountability and uphold security and privacy') is a common direct-recall question; also expect scenario questions asking who owns a specific responsibility (e.g. backups, email security).",
    commonTraps:
      "Don't confuse this model's purpose with CMDB Health (data integrity), Config Compliance/Security Center (risk assessment), or ATF (automated testing) — those are related but distinct capabilities, frequently used as wrong-answer distractors.",
    exampleScenario:
      "A customer assumes ServiceNow handles all backup and restoration. Under the Shared Responsibility Model, ServiceNow is responsible for platform backups, but the customer must still validate that their data/configuration state meets their own recovery requirements.",
  },

  "ui-policies": {
    overview:
      "UI Policies declaratively control client-side field behavior — mandatory, read-only, and visible — based on form conditions, applying immediately while a user works on the form, without writing a full Client Script.",
    whyItMatters:
      "UI Policy vs. Client Script vs. Business Rule vs. Data Policy is one of the single most tested distinctions on the entire CSA exam.",
    coreConcepts:
      "- **UI Policy** — declarative, condition-based control of Mandatory / Read-only / Visible field states\n- Runs entirely client-side, applies immediately as the user interacts with the form\n- Can also run associated UI Policy Actions or optional scripts (onTrue/onFalse)\n- Not used for auditing or field-level encryption — those are separate mechanisms",
    terminology:
      "- **UI Policy Action** — the specific field-state change a UI Policy applies\n- **Condition** — the form-state trigger for the policy (e.g. State = Resolved)\n- **Reverse if false** — automatically undoes the action when the condition no longer matches",
    howItWorks:
      "A UI Policy watches specified form field(s); when its condition evaluates true, it immediately applies its configured Mandatory/Read-only/Visible actions client-side — no page reload or server round-trip needed, and (if configured) reverses those actions automatically when the condition becomes false again.",
    adminTasks:
      "- Make a field mandatory only under a specific form condition\n- Hide/show fields dynamically based on another field's value\n- Convert a UI Policy to run server-side as well when validation must not be bypassable",
    examFocus:
      "Classic exam scenario: 'a field must become mandatory only when State = Resolved, immediately while the user works on the form' → UI Policy (not Business Rule, which is server-side and not immediate to the client).",
    commonTraps:
      "UI Policies only control Mandatory/Read-only/Visible — they do not control Auditing or Encryption, which are separate, unrelated field-level mechanisms often offered as distractors.",
    exampleScenario:
      "An admin needs the Resolution Notes field to become mandatory the instant a user sets State to Resolved, before the form is submitted. A UI Policy with a condition on State handles this client-side, immediately.",
  },

  "business-rules": {
    overview:
      "Business Rules run server-side JavaScript when a record is queried, inserted, updated, or deleted, enforcing logic and automation that must happen reliably regardless of which client or integration touched the record.",
    whyItMatters:
      "Business Rules are the primary server-side automation mechanism and a constant point of comparison against Client Scripts/UI Policies on the exam.",
    coreConcepts:
      "- **When** — before, after, async, display, query\n- Runs server-side, so it applies consistently across UI, API, and integrations\n- Can enforce logic a client-side control could otherwise be bypassed on\n- **Order** — controls execution sequence among multiple Business Rules on the same table/event",
    terminology:
      "- **Before/After/Async/Display/Query** — Business Rule timing types\n- **Order (Weight)** — numeric field controlling run sequence; lower runs first\n- **current** / **previous** — script objects representing the record's new/prior state",
    howItWorks:
      "When a triggering database operation occurs, the platform runs all applicable, active Business Rules for that table/event in Order sequence, each with access to the record (current) and, for update operations, its prior state (previous) — letting logic run reliably no matter how the record was changed.",
    adminTasks:
      "- Enforce a server-side validation Client Scripts can't be trusted to guarantee\n- Automatically populate or correct a field on insert/update\n- Sequence multiple Business Rules using the Order/Weight field",
    examFocus:
      "Know that Business Rules are server-side and apply universally (including to API/integration writes), unlike Client Scripts/UI Policies, which are UI-only and bypassable via direct API calls.",
    commonTraps:
      "If a requirement must hold true even for data coming in through an integration or import (not just the form), the correct mechanism is a Business Rule (or Data Policy), not a Client Script/UI Policy.",
    exampleScenario:
      "An administrator needs a field to always be set to a calculated value regardless of whether the record came from the UI, an integration, or an import. A Business Rule guarantees this because it runs server-side on every write.",
  },

  "system-update-sets": {
    overview:
      "Update Sets are the primary mechanism for capturing configuration changes (not data) in one instance and moving them to another — typically promoting from development to test to production.",
    whyItMatters:
      "Update Sets are the backbone of safe, controlled configuration migration and one of the most consistently tested Data Migration topics.",
    coreConcepts:
      "- **Update Set** — a collection of configuration changes that can be moved between instances\n- **States**: In progress/Draft-equivalent state while being built, **Complete** when finished and ready to move, **Ignore** to exclude specific updates from being applied on commit\n- **Default update set** — the update set new changes are captured into for a given scope; setting one as default flips all other update sets in that scope to non-default\n- Update Sets capture configuration only — not table data/records",
    terminology:
      "- **Complete** — the update set is finished and ready to move to another instance\n- **Ignore** — the update/update set is skipped and not applied on commit\n- **Retrieve/Preview/Commit** — the steps for applying an update set on the target instance\n- **Collision** — when an incoming update conflicts with a change already made on the target",
    howItWorks:
      "While an update set is active/default, configuration changes an admin makes are automatically captured into it; the admin marks it Complete, exports/retrieves it on the target instance, previews for collisions, then commits to apply the captured changes there.",
    adminTasks:
      "- Mark an update set Complete before migrating it\n- Preview an incoming update set for collisions before committing\n- Set the correct default update set before starting a body of configuration work",
    examFocus:
      "Know the valid Update Set states (Complete, Ignore are Update-Set-specific; Draft/Published are Knowledge Article states, a very common exam mix-up) and what happens when 'default' is toggled on one (others in scope flip off).",
    commonTraps:
      "Draft and Published are Knowledge Article workflow states, not Update Set states — this exact substitution is a frequent exam distractor.",
    exampleScenario:
      "A developer finishes configuring a new workflow in a dev instance, marks the Update Set Complete, and migrates it to production — the underlying data records created during testing are not included, only the configuration.",
  },

  "scripting-in-servicenow": {
    overview:
      "ServiceNow scripting is primarily JavaScript, both server-side (Business Rules, Script Includes) and client-side (Client Scripts), built on platform-provided APIs like GlideRecord and GlideSystem that provide reusable classes/methods for common operations.",
    whyItMatters:
      "Knowing which language the platform uses, and which mechanism (API vs. Business Rule vs. Client Script) provides vs. consumes functionality, is foundational exam knowledge.",
    coreConcepts:
      "- **JavaScript** — the primary scripting language across client and server\n- **APIs** (e.g. GlideRecord, GlideSystem) — provide reusable server/client classes and methods that other mechanisms consume\n- **Client Script** — runs in the user's browser (onLoad, onChange, onSubmit) for immediate, client-side behavior\n- Jelly is legacy markup for older UI Pages/Macros; Python/other languages are only relevant for external integrations, not core platform scripting",
    terminology:
      "- **GlideRecord** — API for querying/manipulating table records server-side\n- **GlideAjax** — API for calling server-side Script Includes from client scripts asynchronously\n- **Script Include** — reusable server-side script, often called via GlideAjax\n- **g_form / g_user** — common client-side script objects",
    howItWorks:
      "Client Scripts run in the browser and react to form events (onLoad/onChange/onSubmit) using client-safe APIs; when server data or logic is needed, they call a Script Include via GlideAjax rather than embedding server logic directly, keeping sensitive logic server-side.",
    adminTasks:
      "- Write a Client Script to adjust form behavior interactively\n- Call a Script Include from a Client Script via GlideAjax for server data\n- Choose the right scripting mechanism (Client Script vs. Business Rule vs. Script Include) for a requirement",
    examFocus:
      "Know that JavaScript (via platform APIs like GlideRecord/GlideSystem) is the primary language, and that APIs 'provide' functionality that Business Rules/Client Scripts/UI Policies then 'consume' — a subtle but tested distinction.",
    commonTraps:
      "Don't select Jelly, Python, or HTML as 'the' primary ServiceNow scripting language — those serve narrow legacy or external-integration roles, not general platform scripting.",
    exampleScenario:
      "A developer needs a Client Script to look up related record data not already on the form. Rather than querying the database directly from the browser, it calls a Script Include through GlideAjax to fetch that data server-side.",
  },
};
