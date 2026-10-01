import {
  ExamSetup,
  PublicQuestion,
  WrittenRubric,
  WrittenEvaluation,
  AIFinalFeedback,
} from "@/types/exam";
import { GeneratedExamPayload } from "@/ai/schemas/exam";

export interface FinalFeedbackInput {
  jobTitle: string;
  level: string;
  totalScore: number;
  timeUsedSeconds: number;
  statsSummary: string;
  language: "ar" | "en";
}

export interface AIProvider {
  name: string;
  generateExam(setup: ExamSetup): Promise<GeneratedExamPayload>;
  evaluateWrittenAnswer(params: {
    question: PublicQuestion;
    rubric: WrittenRubric;
    answer: string;
    maxScore: number;
    language: "ar" | "en";
  }): Promise<WrittenEvaluation>;
  generateFinalFeedback(input: FinalFeedbackInput): Promise<AIFinalFeedback>;
  generatePracticeExam(params: {
    setup: ExamSetup;
    weakCategories: string[];
    missedConcepts: string[];
    count: number;
  }): Promise<GeneratedExamPayload>;
}
