/**
 * Current CSA exam blueprint, stored as versioned seed data.
 *
 * This file is the *initial* source of truth loaded into the `blueprint_versions`,
 * `exam_domains`, `topics`, and `subtopics` tables by `prisma/seed.ts`. Once seeded,
 * the running application reads exclusively from the database — nothing in the
 * app's runtime code hard-codes domain weights or topic lists. When ServiceNow
 * revises the CSA blueprint, an admin creates a new BlueprintVersion (see the
 * Admin > Blueprint screen) rather than editing this file and redeploying.
 */

export interface SubtopicSeed {
  slug: string;
  name: string;
}

export interface TopicSeed {
  slug: string;
  name: string;
  subtopics?: SubtopicSeed[];
}

export interface DomainSeed {
  code: string;
  name: string;
  weightPercent: number;
  description: string;
  topics: TopicSeed[];
}

export const BLUEPRINT_VERSION = {
  version: "CSA-2026.1",
  effectiveDate: new Date("2026-01-01"),
  // Official ServiceNow CSA certification / exam-guide landing page (Tier 1).
  // The specific blueprint PDF ServiceNow links from this page is what should be
  // re-checked whenever this version is superseded.
  sourceUrl: "https://www.servicenow.com/services/training-and-certification/certification/csa.html",
  sourceTitle: "ServiceNow Certified System Administrator (CSA) — Certification overview",
  examDurationMinutes: 90,
  questionCount: 60,
  status: "ACTIVE" as const,
  notes:
    "Domain weights below reflect the publicly described CSA exam blueprint structure. ServiceNow does not publish a numeric pass mark; this platform never asserts one. Re-validate weights against the current official exam guide before relying on them for a real exam date.",
};

export const DOMAINS: DomainSeed[] = [
  {
    code: "D1",
    name: "Platform Overview and Navigation",
    weightPercent: 7,
    description:
      "Foundational orientation to the Now Platform: what it is, what it's used for, and how administrators and users move around an instance.",
    topics: [
      {
        slug: "platform-overview",
        name: "ServiceNow Platform Overview",
        subtopics: [
          { slug: "platform-capabilities", name: "Platform capabilities and services" },
        ],
      },
      {
        slug: "servicenow-instance",
        name: "The ServiceNow Instance",
        subtopics: [
          { slug: "instance-architecture", name: "Instance architecture basics" },
          { slug: "instance-types", name: "Instance types (dev/test/prod)" },
        ],
      },
      {
        slug: "unified-navigation",
        name: "Next Experience Unified Navigation",
        subtopics: [
          { slug: "all-menu-favorites", name: "All menu, Favorites, and History" },
          { slug: "global-search", name: "Global search" },
        ],
      },
    ],
  },
  {
    code: "D2",
    name: "Instance Configuration",
    weightPercent: 10,
    description:
      "How administrators install and enable functionality, and personalize the platform's common interfaces for themselves and end users.",
    topics: [
      {
        slug: "installing-applications-plugins",
        name: "Installing Applications and Plugins",
        subtopics: [
          { slug: "plugins", name: "Activating plugins" },
          { slug: "servicenow-store", name: "ServiceNow Store applications" },
        ],
      },
      {
        slug: "personalizing-the-instance",
        name: "Personalizing and Customizing the Instance",
        subtopics: [
          { slug: "user-preferences", name: "User preferences and themes" },
        ],
      },
      {
        slug: "common-user-interfaces",
        name: "Common User Interfaces in the Platform",
        subtopics: [
          { slug: "workspaces", name: "Workspaces" },
          { slug: "service-portal-employee-center", name: "Service Portal and Employee Center" },
        ],
      },
    ],
  },
  {
    code: "D3",
    name: "Configuring Applications for Collaboration",
    weightPercent: 20,
    description:
      "Day-to-day administrator configuration of how users see and work with data: lists, forms, task management, and reporting.",
    topics: [
      {
        slug: "lists-filters-tags",
        name: "Lists, Filters, and Tags",
        subtopics: [
          { slug: "list-anatomy", name: "List anatomy" },
          { slug: "filters-conditions", name: "Filters and conditions" },
          { slug: "tags", name: "Tags" },
        ],
      },
      {
        slug: "forms",
        name: "Forms",
        subtopics: [
          { slug: "form-anatomy", name: "Form anatomy" },
          { slug: "form-configuration", name: "Form configuration" },
          { slug: "form-templates", name: "Form templates" },
          { slug: "saving-options", name: "Saving options" },
          { slug: "advanced-form-configuration", name: "Advanced form configuration" },
        ],
      },
      {
        slug: "task-management-vtb",
        name: "Task Management and Visual Task Boards",
        subtopics: [{ slug: "visual-task-boards", name: "Visual Task Boards" }],
      },
      {
        slug: "visualizations-dashboards-pa",
        name: "Visualizations, Dashboards, and Performance Analytics",
        subtopics: [
          { slug: "reports", name: "Reports" },
          { slug: "dashboards", name: "Dashboards" },
          { slug: "performance-analytics", name: "Performance Analytics" },
        ],
      },
      {
        slug: "notifications",
        name: "Notifications",
      },
    ],
  },
  {
    code: "D4",
    name: "Self Service and Automation",
    weightPercent: 20,
    description:
      "The platform's employee-facing automation surfaces: knowledge, catalog-based fulfillment, low-code workflow, and conversational assistance.",
    topics: [
      {
        slug: "knowledge-management",
        name: "Knowledge Management",
      },
      {
        slug: "service-catalog",
        name: "Service Catalog",
        subtopics: [
          { slug: "catalog-items-record-producers", name: "Catalog items and Record Producers" },
          { slug: "request-fulfillment", name: "Request fulfillment (REQ/RITM/SCTASK)" },
        ],
      },
      {
        slug: "workflow-studio",
        name: "Workflow Studio and Flow Designer",
      },
      {
        slug: "virtual-agent",
        name: "Virtual Agent",
      },
    ],
  },
  {
    code: "D5",
    name: "Database Management and Platform Security",
    weightPercent: 30,
    description:
      "The largest domain: how data is modeled and imported, how the CMDB and CSDM organize service data, and how the platform's security model and shared-responsibility boundaries protect it.",
    topics: [
      {
        slug: "data-schema",
        name: "Data Schema",
        subtopics: [
          { slug: "tables-and-fields", name: "Tables and fields" },
          { slug: "table-extension", name: "Table extension and inheritance" },
        ],
      },
      {
        slug: "access-control",
        name: "Application and Access Control (ACLs, Roles)",
        subtopics: [
          { slug: "acl-evaluation", name: "ACL evaluation order" },
          { slug: "roles-permissions", name: "Roles and permissions" },
        ],
      },
      {
        slug: "importing-data",
        name: "Importing Data (Import Sets, Transform Maps, Coalesce)",
      },
      {
        slug: "cmdb",
        name: "Configuration Management Database (CMDB)",
      },
      {
        slug: "csdm",
        name: "Common Service Data Model (CSDM)",
      },
      {
        slug: "security-center",
        name: "Security Center",
      },
      {
        slug: "shared-responsibility-model",
        name: "Shared Responsibility Model",
      },
    ],
  },
  {
    code: "D6",
    name: "Data Migration and Integration",
    weightPercent: 13,
    description:
      "Moving configuration safely between instances and controlling platform behavior with declarative and scripted logic.",
    topics: [
      {
        slug: "ui-policies",
        name: "UI Policies",
      },
      {
        slug: "business-rules",
        name: "Business Rules",
      },
      {
        slug: "system-update-sets",
        name: "System Update Sets",
      },
      {
        slug: "scripting-in-servicenow",
        name: "Scripting in ServiceNow (Client Scripts & APIs)",
      },
    ],
  },
];
