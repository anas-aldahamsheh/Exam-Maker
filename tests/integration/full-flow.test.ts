import { describe, it, expect } from "vitest";
import { synthesizeExam } from "@/exam/generation";
import { gradeExamAttempt } from "@/exam/scoring";
import { canTransition, isExamLocked } from "@/exam/state-machine";
import { ExamSetup } from "@/types/exam";

describe("End-to-End Exam Lifecycle Integration (F044, F046)", () => {
  it("executes the full examination lifecycle from setup to grading and review", async () => {
    // 1. Setup
    const setup: ExamSetup = {
      jobTitle: "Senior Distributed Systems Engineer",
      experienceLevel: "senior",
      questionType: "mixed",
      difficulty: "mixed",
      questionCount: 4,
      durationMinutes: 20,
      language: "en",
    };

    // 2. Synthesize Exam
    const attempt = await synthesizeExam(setup);
    expect(attempt).toBeDefined();
    expect(attempt.questions.length).toBe(4);
    expect(attempt.state).toBe("READY");

    // CRITICAL SECURITY ASSERTION: Public questions must NEVER leak answer keys
    for (const q of attempt.questions) {
      expect((q as any).correctOptionId).toBeUndefined();
      expect((q as any).explanation).toBeUndefined();
      expect((q as any).writtenCriteria).toBeUndefined();
    }

    // 3. Weight normalization assertion
    const totalPoints = attempt.questions.reduce((sum, q) => sum + q.points, 0);
    expect(totalPoints).toBe(100);

    // 4. State transition to ACTIVE
    expect(canTransition("READY", "ACTIVE")).toBe(true);
    attempt.state = "ACTIVE";

    // 5. Answer questions
    const mcqQuestions = attempt.questions.filter((q) => q.type === "mcq");
    const writtenQuestions = attempt.questions.filter((q) => q.type === "written");

    expect(mcqQuestions.length).toBeGreaterThan(0);
    expect(writtenQuestions.length).toBeGreaterThan(0);

    const nowIso = new Date().toISOString();
    attempt.answers[mcqQuestions[0].id] = {
      questionId: mcqQuestions[0].id,
      type: "mcq",
      selectedOptionId: "A",
      lastUpdated: nowIso,
    };

    attempt.answers[writtenQuestions[0].id] = {
      questionId: writtenQuestions[0].id,
      type: "written",
      writtenResponse:
        "We implement horizontal scaling using partition keys, consistent hashing, and eventual consistency backed by circuit breakers.",
      lastUpdated: nowIso,
    };

    // 6. Submit exam
    expect(canTransition("ACTIVE", "SUBMITTED")).toBe(true);
    attempt.state = "SUBMITTED";
    attempt.submittedAt = nowIso;
    attempt.submissionReason = "manual";

    expect(isExamLocked(attempt.state)).toBe(true);

    // 7. Grade exam
    const result = await gradeExamAttempt(attempt);

    expect(result).toBeDefined();
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(100);
    expect(result.totalPoints).toBe(100);
    expect(result.status).toMatch(/passed|needs_work/);

    // Analytics assertions
    expect(result.difficultyAnalytics).toBeDefined();
    expect(result.categoryAnalytics.length).toBeGreaterThan(0);

    // AI Final feedback assertions
    expect(result.feedback).toBeDefined();
    expect(result.feedback.overallPerformance).toBeTruthy();
    expect(result.feedback.strengths.length).toBeGreaterThan(0);
    expect(result.feedback.studyAdvice.length).toBeGreaterThan(0);

    // Review assertions: answers and explanations now accessible in result
    for (const q of attempt.questions) {
      const qRes = result.questionResults[q.id];
      expect(qRes).toBeDefined();
      expect(typeof qRes.scoreAwarded).toBe("number");
      expect(qRes.scoreAwarded).toBeLessThanOrEqual(q.points);
    }
  });
});
