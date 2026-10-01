import { ExamState } from "@/types/exam";

export const VALID_TRANSITIONS: Record<ExamState, ExamState[]> = {
  SETUP: ["GENERATING", "ERROR"],
  GENERATING: ["READY", "ERROR"],
  READY: ["ACTIVE", "ERROR"],
  ACTIVE: ["SUBMITTING", "SUBMITTED", "ERROR"],
  SUBMITTING: ["SUBMITTED", "ERROR"],
  SUBMITTED: ["GRADING", "ERROR"],
  GRADING: ["COMPLETED", "ERROR"],
  COMPLETED: [], // Final state
  ERROR: ["SETUP", "READY", "GRADING"], // Controlled recovery paths
};

export function canTransition(from: ExamState, to: ExamState): boolean {
  if (from === to) return true; // Idempotency
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: ExamState, to: ExamState): void {
  if (!canTransition(from, to)) {
    throw new Error(`Forbidden state transition from ${from} to ${to}`);
  }
}

export function isExamActive(state: ExamState): boolean {
  return state === "ACTIVE";
}

export function isExamLocked(state: ExamState): boolean {
  return ["SUBMITTING", "SUBMITTED", "GRADING", "COMPLETED"].includes(state);
}

export function canModifyAnswers(state: ExamState, isExpired: boolean): boolean {
  if (isExpired) return false;
  return state === "ACTIVE";
}
