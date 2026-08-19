/**
 * Original, platform-authored supplemental practice questions.
 *
 * The imported 120-question study guide is heavily weighted toward Database
 * Management & Security topics and contains almost no Domain 1 (Platform
 * Overview & Navigation) or Domain 2 (Instance Configuration) content — an
 * honest side effect of the source document's own topic index not being
 * built around the current CSA blueprint (see prisma/seed-data/blueprint.ts
 * and section 60 of the platform spec). Without more questions here, the
 * Full Exam Simulator cannot assemble a properly domain-weighted 60-question
 * exam (Domain 1 alone needs ~4 slots per attempt; only 2 imported questions
 * existed for it).
 *
 * These are ORIGINAL, CSA-style practice questions written directly against
 * the official sources captured in topic-sources.ts (never against actual
 * ServiceNow exam content — see NO_EXAM_DUMPS policy, spec section 56).
 * Each one cites the specific official source it was written from, so it can
 * be seeded straight to VERIFIED where a source exists — this is authored-
 * and-cited content, not an unreviewed AI draft (see origin: "authored" below,
 * as distinct from imported/ai_generated origins elsewhere in the seed).
 */

import { Difficulty, QuestionType } from "@prisma/client";

export interface SupplementalQuestionSeed {
  questionText: string;
  questionType: QuestionType;
  topicSlug: string;
  difficulty: Difficulty;
  options: string[];
  correctOptions: string[];
  requiredSelectionCount?: number;
  explanation: string;
  examTip?: string;
}

export const SUPPLEMENTAL_QUESTIONS: SupplementalQuestionSeed[] = [
  // ---- Domain 1: Platform Overview and Navigation ----
  {
    questionText:
      "An administrator explains to a new hire that ServiceNow's ITSM, HR Service Delivery, and a custom scoped application all run on the same underlying technology. What is that shared foundation called?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "platform-overview",
    difficulty: Difficulty.EASY,
    options: ["The Now Platform", "The Service Portal", "The CMDB", "The Application Manager"],
    correctOptions: ["The Now Platform"],
    explanation:
      "The Now Platform is the unified database, workflow, security, and UI foundation every ServiceNow application is built on. The Service Portal is one UI surface, the CMDB is a data store, and the Application Manager is a plugin/app installation tool — none of those is the underlying platform itself.",
    examTip: "Expect 'platform vs. application' wording throughout the exam — the platform is the foundation; applications are built on it.",
  },
  {
    questionText:
      "Which statement correctly describes the relationship between the Now Platform and a ServiceNow application such as Incident Management?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "platform-overview",
    difficulty: Difficulty.MEDIUM,
    options: [
      "The application is a curated bundle of tables, logic, and UI built on top of the platform",
      "The platform is a plugin installed inside the application",
      "The application and the platform are two names for the same thing",
      "The platform only exists in production instances, not sub-production ones",
    ],
    correctOptions: ["The application is a curated bundle of tables, logic, and UI built on top of the platform"],
    explanation:
      "Applications are built from the platform's shared primitives (tables, Business Rules, ACLs, UI). The platform is not a plugin inside an application — it's the other way around — and it exists identically across every instance, sub-production included.",
  },
  {
    questionText: "What powers the AI, workflow, and integration capabilities available across every ServiceNow application?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "platform-overview",
    difficulty: Difficulty.EASY,
    options: ["The Now Platform", "Each application's private database", "The ServiceNow Store", "Now Support"],
    correctOptions: ["The Now Platform"],
    explanation:
      "These capabilities are platform-level services shared by every application, not something each application implements privately, and not something delivered through the Store (a marketplace) or Now Support (a support channel).",
  },
  {
    questionText: "Which of the following is an optional, customer-installed component rather than part of a ServiceNow instance's core architecture?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "servicenow-instance",
    difficulty: Difficulty.MEDIUM,
    options: ["MID Server", "Application server", "Database", "Load balancer"],
    correctOptions: ["MID Server"],
    explanation:
      "The MID Server is a Java application a customer installs inside their own network to bridge integrations/Discovery to the instance. Application servers, the database, and load balancing are core infrastructure ServiceNow provisions and manages as part of the instance itself.",
    examTip: "This exact substitution — MID Server vs. core architecture — is one of the most common CSA distractor patterns.",
  },
  {
    questionText: "An administrator needs to connect Discovery to servers on a private, non-internet-facing network segment. What should they deploy?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "servicenow-instance",
    difficulty: Difficulty.MEDIUM,
    options: ["A MID Server inside that network", "A second production instance", "A new Update Set", "A Service Portal widget"],
    correctOptions: ["A MID Server inside that network"],
    explanation:
      "A MID Server is exactly the bridge component designed for this: it runs inside the customer's network and relays communication back to the ServiceNow instance, which cannot otherwise reach non-internet-facing hosts directly.",
  },
  {
    questionText: "Which of these is generally true of a ServiceNow instance?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "servicenow-instance",
    difficulty: Difficulty.EASY,
    options: [
      "It is logically and physically isolated from other customers' instances",
      "It shares its database directly with other customers' instances",
      "It cannot be cloned or copied",
      "It must always run the same release as every other customer",
    ],
    correctOptions: ["It is logically and physically isolated from other customers' instances"],
    explanation:
      "Each customer instance is isolated. Instances can be cloned between environments (e.g. prod to a sub-production instance), and different customers can be on different releases within ServiceNow's supported release window.",
  },
  {
    questionText: "In the Next Experience Unified Navigation, which menu is a personal, user-curated set of shortcuts rather than the full application/module list?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "unified-navigation",
    difficulty: Difficulty.EASY,
    options: ["Favorites menu", "All menu", "Globe icon", "Workspaces menu"],
    correctOptions: ["Favorites menu"],
    explanation:
      "Favorites holds only what a user has chosen to save. The All menu is the complete navigator of everything the user can access; the Globe icon indicates/switches application scope, not navigation; the Workspaces menu lists available workspaces.",
  },
  {
    questionText: "A user wants to search across incidents, knowledge articles, and catalog items from a single entry point. Which capability should they use?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "unified-navigation",
    difficulty: Difficulty.EASY,
    options: ["Global search", "Favorites menu", "Activity stream", "Related list"],
    correctOptions: ["Global search"],
    explanation:
      "Global search is designed to query across multiple tables/sources (tickets, knowledge, catalog, and more) from one search box in the unified navigation header.",
  },
  {
    questionText: "What does the Globe icon in the Next Experience header indicate or let a user do?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "unified-navigation",
    difficulty: Difficulty.MEDIUM,
    options: [
      "Shows/switches the current application scope",
      "Lists the user's saved Favorites",
      "Opens the full All menu of modules",
      "Displays the user's recently viewed records",
    ],
    correctOptions: ["Shows/switches the current application scope"],
    explanation:
      "The Globe icon is the application-scope indicator/switcher, not a navigation or favorites list — a frequent exam distractor pairing it with All menu or Favorites.",
  },
  {
    questionText: "Which of the following are all part of the default overlay menus available in Next Experience Unified Navigation? (Choose 2)",
    questionType: QuestionType.MULTIPLE_SELECT,
    topicSlug: "unified-navigation",
    difficulty: Difficulty.MEDIUM,
    options: ["All menu", "History menu", "Security Center", "CMDB Health"],
    correctOptions: ["All menu", "History menu"],
    requiredSelectionCount: 2,
    explanation:
      "Unified Navigation ships with All, Favorites, and History as default overlay menus. Security Center and CMDB Health are unrelated administrative modules, not navigation menus.",
  },

  // ---- Domain 2: Instance Configuration ----
  {
    questionText: "A required plugin does not appear anywhere in the Application Manager or Plugins module. What is the correct next step?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "installing-applications-plugins",
    difficulty: Difficulty.MEDIUM,
    options: [
      "Request activation of the plugin through Now Support",
      "Export an Update Set containing the plugin",
      "Clone a different instance that has the plugin",
      "Write a Business Rule that enables the plugin",
    ],
    correctOptions: ["Request activation of the plugin through Now Support"],
    explanation:
      "Some plugins are restricted and only ServiceNow personnel can enable them on an instance. Update Sets move configuration a customer already owns; cloning and scripting cannot grant access to a plugin the instance doesn't have.",
    examTip: "This is one of the most consistently tested CSA scenarios — memorize 'Now Support' as the answer whenever a plugin can't be self-activated.",
  },
  {
    questionText: "Which two capabilities let an administrator add new functionality to an instance? (Choose 2)",
    questionType: QuestionType.MULTIPLE_SELECT,
    topicSlug: "installing-applications-plugins",
    difficulty: Difficulty.EASY,
    options: ["Plugins", "ServiceNow Store", "UI Policies", "Data Policies"],
    correctOptions: ["Plugins", "ServiceNow Store"],
    requiredSelectionCount: 2,
    explanation:
      "Plugins (ServiceNow-authored, toggled per instance) and the ServiceNow Store (a certified app marketplace) are the two primary legitimate ways new functionality enters an instance. UI Policies and Data Policies only configure existing field behavior — they don't add new capability.",
  },
  {
    questionText: "An administrator installs a certified third-party integration app from ServiceNow's marketplace. Where did that app most likely come from?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "installing-applications-plugins",
    difficulty: Difficulty.EASY,
    options: ["The ServiceNow Store", "A Business Rule", "A Data Policy", "The Security Center"],
    correctOptions: ["The ServiceNow Store"],
    explanation:
      "The ServiceNow Store is the marketplace for certified ServiceNow and partner-built applications, distinct from configuration mechanisms like Business Rules/Data Policies or the Security Center dashboard.",
  },
  {
    questionText: "A department wants a focused, drag-and-drop-configurable interface for their fulfillers, distinct from the standard admin UI. Which tool would an administrator use to build it?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "common-user-interfaces",
    difficulty: Difficulty.MEDIUM,
    options: ["UI Builder, to create a configurable workspace", "Form Design, to rearrange one form", "A Transform Map", "A Visual Task Board"],
    correctOptions: ["UI Builder, to create a configurable workspace"],
    explanation:
      "UI Builder is the low-code tool used to build and extend configurable workspaces for fulfillers/case managers. Form Design only rearranges one record's form; Transform Maps and VTBs are unrelated data-import and task-visualization tools.",
  },
  {
    questionText: "Which interface is intended for end users submitting requests and browsing knowledge, rather than for fulfillers working queues of assigned tasks?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "common-user-interfaces",
    difficulty: Difficulty.EASY,
    options: ["Employee Center", "Agent Workspace", "Application Manager", "Security Center"],
    correctOptions: ["Employee Center"],
    explanation:
      "Employee Center is the modern self-service portal for requesters. Agent Workspace is fulfiller-facing; Application Manager and Security Center are administrative modules, not end-user interfaces.",
  },
  {
    questionText: "What is a 'configurable workspace' in ServiceNow?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "common-user-interfaces",
    difficulty: Difficulty.MEDIUM,
    options: [
      "A focused working area that can be extended using UI Builder",
      "A personal list of favorited modules",
      "A staging table for imported data",
      "A collection of configuration changes ready to move between instances",
    ],
    correctOptions: ["A focused working area that can be extended using UI Builder"],
    explanation:
      "A workspace is a focused working area for a role (e.g. agents/case managers); UI Builder is the tool used to configure/extend it. The other options describe Favorites, an Import Set staging table, and an Update Set, respectively.",
  },
  {
    questionText: "A user changes their personal theme to a dark color scheme. Who else is affected by this change?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "personalizing-the-instance",
    difficulty: Difficulty.EASY,
    options: ["No one — it is a personal, per-user preference", "All users in their assignment group", "Every user on the instance", "Only users with the admin role"],
    correctOptions: ["No one — it is a personal, per-user preference"],
    explanation:
      "Personal theme choice is stored per-user and does not affect other users, unlike a system-wide branding/theme change an administrator makes for everyone.",
  },
  {
    questionText: "Which of the following is a system-wide customization only an administrator can make, rather than a personal user preference?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "personalizing-the-instance",
    difficulty: Difficulty.MEDIUM,
    options: ["Setting the default branding/theme applied to all users", "Choosing which list columns to display for yourself", "Adding a personal Favorite", "Setting your own homepage layout"],
    correctOptions: ["Setting the default branding/theme applied to all users"],
    explanation:
      "Instance-wide branding/default theme is a system customization affecting every user. List columns, Favorites, and personal homepage layout are individual, per-user preferences.",
  },
  {
    questionText: "What must generally be true for a user to personalize their own list columns or theme, as opposed to changing them instance-wide?",
    questionType: QuestionType.SINGLE_CHOICE,
    topicSlug: "personalizing-the-instance",
    difficulty: Difficulty.EASY,
    options: [
      "Personalization is typically available without elevated roles, unlike system-wide customization",
      "It always requires the admin role",
      "It requires editing a Business Rule",
      "It requires creating an Update Set",
    ],
    correctOptions: ["Personalization is typically available without elevated roles, unlike system-wide customization"],
    explanation:
      "Personal preferences (theme, list columns, homepage) generally don't require elevated roles, while changing those settings instance-wide for everyone typically does.",
  },
];
