import { describe, expect, it } from "vitest";
import { buildWrittenEvaluationPrompt } from "@/ai/prompts/templates";
import type { PublicQuestion, WrittenRubric } from "@/types/exam";

const question: PublicQuestion = {
  id: "q_1",
  type: "written",
  text: "Explain how you would remove a data-fetching waterfall in a Server Component tree.",
  difficulty: "medium",
  category: "Performance",
  points: 12,
};

const rubric: WrittenRubric = {
  questionId: "q_1",
  expectedCriteria: ["Starts independent requests in parallel"],
  importantConcepts: ["Promise.all", "Suspense"],
  maxScore: 12,
};

describe("buildWrittenEvaluationPrompt", () => {
  const prompt = buildWrittenEvaluationPrompt({ question, rubric, answer: "Use Promise.all.", maxScore: 12 });

  it("spells out every JSON key the Gemini provider parses", () => {
    for (const key of [
      '"score"',
      '"dimensionScores"',
      '"correctness"',
      '"completeness"',
      '"technicalUnderstanding"',
      '"relevance"',
      '"clarity"',
      '"whatWasCorrect"',
      '"whatWasMissing"',
      '"mistakes"',
      '"suggestedBetterAnswer"',
      '"confidence"',
    ]) {
      expect(prompt).toContain(key);
    }
  });

  it("bounds the score by the question's maximum", () => {
    expect(prompt).toContain('"score": <integer 0-12>');
  });
});
