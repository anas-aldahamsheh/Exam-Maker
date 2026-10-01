import { describe, it, expect } from "vitest";
import { sealAnswerKey, unsealAnswerKey } from "@/lib/security/crypto";
import { SealedAnswerKeyPayload } from "@/types/exam";

describe("Hidden Answer Key Cryptographic Protection (F010)", () => {
  const mockPayload: SealedAnswerKeyPayload = {
    attemptId: "test-attempt-123",
    mcqKeys: {
      q_1: {
        questionId: "q_1",
        correctOptionId: "B",
        explanation: "Option B is correct because of X",
      },
    },
    writtenRubrics: {
      q_2: {
        questionId: "q_2",
        expectedCriteria: ["Criteria 1", "Criteria 2"],
        importantConcepts: ["Concept A"],
        maxScore: 25,
      },
    },
    questions: [],
    setup: {
      jobTitle: "Software Engineer",
      experienceLevel: "mid",
      questionType: "mixed",
      difficulty: "medium",
      questionCount: 2,
      durationMinutes: 30,
      language: "en",
    },
    issuedAt: Date.now(),
  };

  it("seals and unseals payload without data loss", () => {
    const sealedToken = sealAnswerKey(mockPayload);
    expect(typeof sealedToken).toBe("string");
    expect(sealedToken.length).toBeGreaterThan(50);

    // Sealed token should not contain plaintext answers
    expect(sealedToken).not.toContain("Option B is correct");
    expect(sealedToken).not.toContain("Concept A");

    const unsealed = unsealAnswerKey(sealedToken);
    expect(unsealed.attemptId).toBe(mockPayload.attemptId);
    expect(unsealed.mcqKeys["q_1"].correctOptionId).toBe("B");
    expect(unsealed.writtenRubrics["q_2"].maxScore).toBe(25);
  });

  it("rejects tampered sealed tokens", () => {
    const sealedToken = sealAnswerKey(mockPayload);
    // Tamper with one character
    const tampered = sealedToken.slice(0, 10) + "X" + sealedToken.slice(11);

    expect(() => unsealAnswerKey(tampered)).toThrow();
  });
});
