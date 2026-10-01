import { QuestionOption } from "@/types/exam";

/**
 * Fisher-Yates shuffle that returns a new array of options in randomized order
 * while preserving option IDs so grading correctness is completely unharmed.
 */
export function shuffleOptions(options: QuestionOption[]): QuestionOption[] {
  const copy = [...options];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
