export type ExperienceLevel = "junior" | "mid" | "senior";
export type QuestionTypeFilter = "mcq" | "written" | "mixed";
export type DifficultyFilter = "easy" | "medium" | "hard" | "mixed";
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type QuestionType = "mcq" | "written";

export interface ExamSetup {
  jobTitle: string;
  jobDescription?: string;
  experienceLevel: ExperienceLevel;
  questionType: QuestionTypeFilter;
  difficulty: DifficultyFilter;
  questionCount: number;
  durationMinutes: number;
  language: "ar" | "en";
}

export interface QuestionOption {
  id: string; // "A", "B", "C", "D"
  text: string;
}

export interface PublicQuestion {
  id: string;
  type: QuestionType;
  text: string;
  difficulty: QuestionDifficulty;
  category: string;
  points: number;
  options?: QuestionOption[]; // only for MCQ
}

export interface McqAnswerKey {
  questionId: string;
  correctOptionId: string;
  explanation: string;
}

export interface WrittenRubric {
  questionId: string;
  expectedCriteria: string[];
  importantConcepts: string[];
  maxScore: number;
}

export interface SealedAnswerKeyPayload {
  attemptId: string;
  mcqKeys: Record<string, McqAnswerKey>;
  writtenRubrics: Record<string, WrittenRubric>;
  questions: PublicQuestion[];
  setup: ExamSetup;
  issuedAt: number;
}

export type ExamState =
  | "SETUP"
  | "GENERATING"
  | "READY"
  | "ACTIVE"
  | "SUBMITTING"
  | "SUBMITTED"
  | "GRADING"
  | "COMPLETED"
  | "ERROR";

export interface UserAnswer {
  questionId: string;
  type: QuestionType;
  selectedOptionId?: string;
  writtenResponse?: string;
  lastUpdated: string;
}

export interface WrittenDimensionScores {
  correctness: number;
  completeness: number;
  technicalUnderstanding: number;
  relevance: number;
  clarity: number;
}

export interface WrittenEvaluation {
  questionId: string;
  score: number;
  maxScore: number;
  dimensionScores: WrittenDimensionScores;
  whatWasCorrect: string[];
  whatWasMissing: string[];
  mistakes: string[];
  suggestedBetterAnswer: string;
  confidence: number;
}

export interface QuestionResult {
  questionId: string;
  type: QuestionType;
  points: number;
  scoreAwarded: number;
  isCorrect?: boolean;
  selectedOptionId?: string;
  correctOptionId?: string;
  explanation?: string;
  writtenResponse?: string;
  evaluation?: WrittenEvaluation;
}

export interface DifficultyStats {
  totalPoints: number;
  scoredPoints: number;
  count: number;
  correctCount: number;
}

export interface DifficultyAnalytics {
  easy: DifficultyStats;
  medium: DifficultyStats;
  hard: DifficultyStats;
}

export interface CategoryAnalytics {
  category: string;
  totalPoints: number;
  scoredPoints: number;
  percentage: number;
  count: number;
}

export interface AIFinalFeedback {
  overallPerformance: string;
  strengths: string[];
  weaknesses: string[];
  commonMistakes: string[];
  topicsToImprove: string[];
  interviewReadiness: string;
  studyAdvice: string[];
  nextAttemptAdvice: string;
}

export interface ExamResult {
  attemptId: string;
  totalScore: number; // deterministic 0 to 100
  totalPoints: number; // exactly 100
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  completedCount: number;
  timeUsedSeconds: number;
  status: "passed" | "needs_work";
  difficultyAnalytics: DifficultyAnalytics;
  categoryAnalytics: CategoryAnalytics[];
  questionResults: Record<string, QuestionResult>;
  feedback: AIFinalFeedback;
  gradedAt: string;
}

export interface ExamAttempt {
  id: string;
  setup: ExamSetup;
  questions: PublicQuestion[];
  sealedToken: string; // Tamper-proof encrypted answer key
  state: ExamState;
  startedAt: string;
  endAt: string;
  submittedAt?: string;
  submissionReason?: "manual" | "early" | "expired";
  answers: Record<string, UserAnswer>;
  reviewFlags: string[];
  result?: ExamResult;
  createdAt: string;
}
