export interface ClientOption {
  id: string;
  text: string;
}

export interface ClientQuestion {
  examQuestionId: string;
  orderIndex: number;
  questionText: string;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_SELECT";
  requiredSelectionCount: number | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  domainName: string;
  topicName: string | null;
  topicSlug: string | null;
  isFlagged: boolean;
  selectedOptionIds: string[];
  confidenceRating: number | null;
  options: ClientOption[];
}

export interface ClientAttempt {
  attemptId: string;
  mode: string;
  totalQuestions: number;
  serverDeadlineAt: string | null;
  durationSeconds: number;
  startedAt: string;
  questions: ClientQuestion[];
}
