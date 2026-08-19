export interface NavLink {
  label: string;
  href: string;
  adminOnly?: boolean;
}

export const PRIMARY_NAV: NavLink[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Study", href: "/study" },
  { label: "Practice", href: "/practice" },
  { label: "Exams", href: "/exams" },
  { label: "Progress", href: "/progress" },
  { label: "Bookmarks", href: "/bookmarks" },
  { label: "Notes", href: "/notes" },
  { label: "Admin", href: "/admin", adminOnly: true },
];

export const STUDY_TABS: NavLink[] = [
  { label: "CSA Domains", href: "/study" },
  { label: "Flashcards", href: "/study/flashcards" },
  { label: "Cheat Sheets", href: "/study/cheat-sheets" },
];

export const PRACTICE_TABS: NavLink[] = [
  { label: "Quick Practice", href: "/practice/quick" },
  { label: "Topic Practice", href: "/practice/topic" },
  { label: "Domain Practice", href: "/practice/domain" },
  { label: "Weak Areas", href: "/practice/weak-areas" },
  { label: "Random Practice", href: "/practice/random" },
];

export const EXAM_TABS: NavLink[] = [
  { label: "Full CSA Exam", href: "/exams" },
  { label: "Timed Practice", href: "/exams/timed" },
  { label: "Exam History", href: "/exams/history" },
];

export const PROGRESS_TABS: NavLink[] = [
  { label: "Performance", href: "/progress" },
  { label: "Weak Areas", href: "/progress/weak-areas" },
  { label: "Readiness", href: "/progress/readiness" },
  { label: "Study History", href: "/progress/history" },
];

export const ADMIN_TABS: NavLink[] = [
  { label: "Overview", href: "/admin" },
  { label: "Questions", href: "/admin/questions" },
  { label: "Validation Queue", href: "/admin/validation" },
  { label: "Sources", href: "/admin/sources" },
  { label: "Blueprint", href: "/admin/blueprint" },
  { label: "Analytics", href: "/admin/analytics" },
];
