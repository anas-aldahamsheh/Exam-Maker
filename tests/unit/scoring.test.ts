import { describe, it, expect } from "vitest";
import { gradeExamAttempt } from "@/exam/scoring";
import { sealAnswerKey } from "@/lib/security/crypto";
import { ExamAttempt, SealedAnswerKeyPayload } from "@/types/exam";

describe("Deterministic Grading Engine (F022, F023, F024)", () => {
  const attemptId = "scoring-test-attempt";
  const now = new Date().toISOString();

  const sealedPayload: SealedAnswerKeyPayload = {
    attemptId,
    mcqKeys: {
      q1: { questionId: "q1", correctOptionId: "B", explanation: "B is right" },
      q2: { questionId: "q2", correctOptionId: "C", explanation: "C is right" },
    },
    writtenRubrics: {
      q3: {
        questionId: "q3",
        expectedCriteria: ["Criteria 1"],
        importantConcepts: ["Consistency", "Partitioning"],
        maxScore: 40,
      },
    },
    questions: [
      { id: "q1", type: "mcq", text: "Q1", difficulty: "easy", category: "Core", points: 30 },
      { id: "q2", type: "mcq", text: "Q2", difficulty: "medium", category: "Core", points: 30 },
      { id: "q3", type: "written", text: "Q3", difficulty: "hard", category: "Architecture", points: 40 },
    ],
    setup: {
      jobTitle: "Lead Engineer",
      experienceLevel: "senior",
      questionType: "mixed",
      difficulty: "mixed",
      questionCount: 3,
      durationMinutes: 30,
      language: "en",
    },
    issuedAt: Date.now(),
  };

  const sealedToken = sealAnswerKey(sealedPayload);

  it("awards exact deterministic points for correct MCQ and 0 for wrong/unanswered", async () => {
    const attempt: ExamAttempt = {
      id: attemptId,
      setup: sealedPayload.setup,
      questions: sealedPayload.questions,
      sealedToken,
      state: "SUBMITTED",
      startedAt: now,
      endAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      submittedAt: now,
      submissionReason: "manual",
      answers: {
        q1: { questionId: "q1", type: "mcq", selectedOptionId: "B", lastUpdated: now }, // Correct (+30)
        q2: { questionId: "q2", type: "mcq", selectedOptionId: "A", lastUpdated: now }, // Wrong (+0)
        // q3 unanswered (+0)
      },
      reviewFlags: [],
      createdAt: now,
    };

    const result = await gradeExamAttempt(attempt, { skipAIFeedback: true });

    expect(result.questionResults["q1"].scoreAwarded).toBe(30);
    expect(result.questionResults["q1"].isCorrect).toBe(true);

    expect(result.questionResults["q2"].scoreAwarded).toBe(0);
    expect(result.questionResults["q2"].isCorrect).toBe(false);

    expect(result.questionResults["q3"].scoreAwarded).toBe(0);
    expect(result.unansweredCount).toBe(1);

    expect(result.totalScore).toBe(30);
    expect(result.totalPoints).toBe(100);
  });

  it("evaluates written responses and clamps score within max bounds", async () => {
    const attempt: ExamAttempt = {
      id: attemptId,
      setup: sealedPayload.setup,
      questions: sealedPayload.questions,
      sealedToken,
      state: "SUBMITTED",
      startedAt: now,
      endAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      submittedAt: now,
      submissionReason: "manual",
      answers: {
        q1: { questionId: "q1", type: "mcq", selectedOptionId: "B", lastUpdated: now }, // 30
        q2: { questionId: "q2", type: "mcq", selectedOptionId: "C", lastUpdated: now }, // 30
        q3: {
          questionId: "q3",
          type: "written",
          writtenResponse: "We achieve eventual consistency using distributed partitioning and saga patterns.",
          lastUpdated: now,
        },
      },
      reviewFlags: [],
      createdAt: now,
    };

    const result = await gradeExamAttempt(attempt, { skipAIFeedback: true });

    expect(result.questionResults["q1"].scoreAwarded).toBe(30);
    expect(result.questionResults["q2"].scoreAwarded).toBe(30);

    const q3Score = result.questionResults["q3"].scoreAwarded;
    expect(q3Score).toBeGreaterThan(0);
    expect(q3Score).toBeLessThanOrEqual(40); // Max score constraint!

    expect(result.totalScore).toBe(60 + q3Score);
    expect(result.totalScore).toBeLessThanOrEqual(100);
  });
});
