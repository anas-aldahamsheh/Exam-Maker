import crypto from "node:crypto";
import {
  ExamSetup,
  ExamAttempt,
  PublicQuestion,
  McqAnswerKey,
  WrittenRubric,
  SealedAnswerKeyPayload,
} from "@/types/exam";
import { getAIProvider } from "@/ai/providers";
import { normalizeWeights, WeightInputItem } from "@/exam/weights";
import { sealAnswerKey } from "@/lib/security/crypto";

export interface SynthesizeExamResult {
  attempt: ExamAttempt;
}

export async function synthesizeExam(setup: ExamSetup): Promise<ExamAttempt> {
  const provider = getAIProvider();
  const rawExam = await provider.generateExam(setup);

  // 1. Prepare items for 100-point weight normalization
  const weightInputItems: WeightInputItem[] = rawExam.questions.map((q) => ({
    id: q.id,
    difficulty: q.difficulty,
    type: q.type,
    rawWeight: q.rawWeight,
  }));

  const weightMap = normalizeWeights(weightInputItems);

  // 2. Separate public questions from hidden keys & rubrics
  const publicQuestions: PublicQuestion[] = [];
  const mcqKeys: Record<string, McqAnswerKey> = {};
  const writtenRubrics: Record<string, WrittenRubric> = {};

  for (const q of rawExam.questions) {
    const points = weightMap.get(q.id) || 1;

    if (q.type === "mcq") {
      publicQuestions.push({
        id: q.id,
        type: "mcq",
        text: q.question,
        difficulty: q.difficulty,
        category: q.category,
        points,
        options: q.options?.map((opt) => ({
          id: opt.id,
          text: opt.text,
        })),
      });

      mcqKeys[q.id] = {
        questionId: q.id,
        correctOptionId: q.correctOptionId || "A",
        explanation: q.explanation || "",
      };
    } else {
      publicQuestions.push({
        id: q.id,
        type: "written",
        text: q.question,
        difficulty: q.difficulty,
        category: q.category,
        points,
      });

      writtenRubrics[q.id] = {
        questionId: q.id,
        expectedCriteria: q.writtenCriteria || [],
        importantConcepts: q.importantConcepts || [],
        maxScore: points,
      };
    }
  }

  // 3. Setup attempt timing and identifiers
  const attemptId = crypto.randomUUID();
  const now = new Date();
  const durationMs = setup.durationMinutes * 60 * 1000;
  const endAt = new Date(now.getTime() + durationMs);

  const sealedPayload: SealedAnswerKeyPayload = {
    attemptId,
    mcqKeys,
    writtenRubrics,
    questions: publicQuestions,
    setup,
    issuedAt: now.getTime(),
  };

  const sealedToken = sealAnswerKey(sealedPayload);

  const attempt: ExamAttempt = {
    id: attemptId,
    setup,
    questions: publicQuestions,
    sealedToken,
    state: "READY",
    startedAt: now.toISOString(),
    endAt: endAt.toISOString(),
    answers: {},
    reviewFlags: [],
    createdAt: now.toISOString(),
  };

  return attempt;
}
