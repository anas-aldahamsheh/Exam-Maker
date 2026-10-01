import { NextRequest, NextResponse } from "next/server";
import { ExamAttempt, PublicQuestion } from "@/types/exam";
import { synthesizeExam } from "@/exam/generation";
import { sealAnswerKey, unsealAnswerKey } from "@/lib/security/crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attempt, mode } = body as {
      attempt: ExamAttempt;
      mode: "weak_areas" | "incorrect_only";
    };

    if (!attempt || !attempt.sealedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid attempt provided" },
        { status: 400 }
      );
    }

    if (mode === "incorrect_only") {
      // Extract unsealed keys to construct fresh practice set
      const unsealed = unsealAnswerKey(attempt.sealedToken);
      const result = attempt.result;

      let missedQuestions: PublicQuestion[] = [];
      if (result) {
        missedQuestions = attempt.questions.filter((q) => {
          const qRes = result.questionResults[q.id];
          return !qRes || !qRes.isCorrect;
        });
      }

      // If no missed questions (candidate got 100%), take all questions
      if (missedQuestions.length === 0) {
        missedQuestions = [...attempt.questions];
      }

      // Build new attempt with missed questions
      const newAttemptId = crypto.randomUUID();
      const now = new Date();
      const durationMs = attempt.setup.durationMinutes * 60 * 1000;
      const endAt = new Date(now.getTime() + durationMs);

      const sealedToken = sealAnswerKey({
        attemptId: newAttemptId,
        mcqKeys: unsealed.mcqKeys,
        writtenRubrics: unsealed.writtenRubrics,
        questions: missedQuestions,
        setup: {
          ...attempt.setup,
          questionCount: missedQuestions.length,
        },
        issuedAt: now.getTime(),
      });

      const practiceAttempt: ExamAttempt = {
        id: newAttemptId,
        setup: {
          ...attempt.setup,
          questionCount: missedQuestions.length,
        },
        questions: missedQuestions,
        sealedToken,
        state: "READY",
        startedAt: now.toISOString(),
        endAt: endAt.toISOString(),
        answers: {},
        reviewFlags: [],
        createdAt: now.toISOString(),
      };

      return NextResponse.json({
        success: true,
        attempt: practiceAttempt,
      });
    } else {
      // Weak areas mode: synthesize new targeted exam
      const newAttempt = await synthesizeExam({
        ...attempt.setup,
        difficulty: "mixed",
      });

      return NextResponse.json({
        success: true,
        attempt: newAttempt,
      });
    }
  } catch (err: unknown) {
    console.error("Practice generation error:", err);
    return NextResponse.json(
      { success: false, error: (err as Error).message || "Failed to generate practice" },
      { status: 500 }
    );
  }
}
