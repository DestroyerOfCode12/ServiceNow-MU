/**
 * Starter achievement set. Instances only — the criteria *types* they
 * reference (AchievementCriteriaType) are the fixed, code-defined
 * vocabulary evaluated in src/lib/gamification/achievements.ts. Admins can
 * add/edit/retire achievements from /admin/achievements without a code
 * change, same as everything else content-shaped on this platform.
 */

export interface AchievementSeed {
  code: string;
  name: string;
  description: string;
  icon: string;
  criteriaType:
    | "STREAK_DAYS"
    | "QUESTIONS_ANSWERED"
    | "EXAMS_COMPLETED"
    | "DOMAIN_PERFECT"
    | "TOPIC_MASTERED_COUNT"
    | "FIRST_EXAM_COMPLETED";
  criteriaThreshold?: number;
  xpReward: number;
  sortOrder: number;
}

export const ACHIEVEMENTS: AchievementSeed[] = [
  {
    code: "first-steps",
    name: "First Steps",
    description: "Answer your first practice question.",
    icon: "🌱",
    criteriaType: "QUESTIONS_ANSWERED",
    criteriaThreshold: 1,
    xpReward: 10,
    sortOrder: 1,
  },
  {
    code: "century-club",
    name: "Century Club",
    description: "Answer 100 questions across all practice modes and exams.",
    icon: "💯",
    criteriaType: "QUESTIONS_ANSWERED",
    criteriaThreshold: 100,
    xpReward: 50,
    sortOrder: 2,
  },
  {
    code: "question-marathon",
    name: "Question Marathon",
    description: "Answer 500 questions — real, sustained practice volume.",
    icon: "🏃",
    criteriaType: "QUESTIONS_ANSWERED",
    criteriaThreshold: 500,
    xpReward: 150,
    sortOrder: 3,
  },
  {
    code: "streak-3",
    name: "Building Momentum",
    description: "Study 3 days in a row.",
    icon: "🔥",
    criteriaType: "STREAK_DAYS",
    criteriaThreshold: 3,
    xpReward: 25,
    sortOrder: 4,
  },
  {
    code: "streak-7",
    name: "Week One",
    description: "Study 7 days in a row.",
    icon: "🔥",
    criteriaType: "STREAK_DAYS",
    criteriaThreshold: 7,
    xpReward: 75,
    sortOrder: 5,
  },
  {
    code: "streak-30",
    name: "Unstoppable",
    description: "Study 30 days in a row.",
    icon: "🔥",
    criteriaType: "STREAK_DAYS",
    criteriaThreshold: 30,
    xpReward: 300,
    sortOrder: 6,
  },
  {
    code: "first-exam",
    name: "Exam Day",
    description: "Complete your first full 60-question CSA exam simulation.",
    icon: "📝",
    criteriaType: "FIRST_EXAM_COMPLETED",
    xpReward: 50,
    sortOrder: 7,
  },
  {
    code: "exam-veteran",
    name: "Exam Veteran",
    description: "Complete 10 full or timed exam simulations.",
    icon: "🎖️",
    criteriaType: "EXAMS_COMPLETED",
    criteriaThreshold: 10,
    xpReward: 200,
    sortOrder: 8,
  },
  {
    code: "domain-perfect",
    name: "Flawless Domain",
    description: "Score 100% accuracy across every question answered in a single CSA domain.",
    icon: "🏆",
    criteriaType: "DOMAIN_PERFECT",
    xpReward: 100,
    sortOrder: 9,
  },
  {
    code: "topics-mastered-5",
    name: "Rising Expert",
    description: "Reach 80%+ accuracy (with at least 3 questions answered) in 5 different topics.",
    icon: "⭐",
    criteriaType: "TOPIC_MASTERED_COUNT",
    criteriaThreshold: 5,
    xpReward: 100,
    sortOrder: 10,
  },
  {
    code: "topics-mastered-15",
    name: "Platform Scholar",
    description: "Reach 80%+ accuracy (with at least 3 questions answered) in 15 different topics.",
    icon: "🎓",
    criteriaType: "TOPIC_MASTERED_COUNT",
    criteriaThreshold: 15,
    xpReward: 250,
    sortOrder: 11,
  },
];
