import {
  ExamAttempt,
  ExamResult,
  QuestionResult,
  DifficultyAnalytics,
  CategoryAnalytics,
  DifficultyStats,
} from "@/types/exam";
import { unsealAnswerKey } from "@/lib/security/crypto";
import { getAIProvider } from "@/ai/providers";

export interface GradeExamOptions {
  skipAIFeedback?: boolean;
}

export async function gradeExamAttempt(
  attempt: ExamAttempt,
  options?: GradeExamOptions
): Promise<ExamResult> {
  const provider = getAIProvider();

  // 1. Unseal the tamper-proof answer key and rubrics
  const sealed = unsealAnswerKey(attempt.sealedToken);
  if (sealed.attemptId !== attempt.id) {
    throw new Error("Sealed token attempt ID mismatch");
  }

  const questionResults: Record<string, QuestionResult> = {};
  let totalScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let completedCount = 0;

  // Initialize difficulty stats
  const diffStats: DifficultyAnalytics = {
    easy: { totalPoints: 0, scoredPoints: 0, count: 0, correctCount: 0 },
    medium: { totalPoints: 0, scoredPoints: 0, count: 0, correctCount: 0 },
    hard: { totalPoints: 0, scoredPoints: 0, count: 0, correctCount: 0 },
  };

  // Category tracking map
  const categoryMap = new Map<
    string,
    { totalPoints: number; scoredPoints: number; count: number }
  >();

  // 2. Grade each question
  for (const question of attempt.questions) {
    const userAnswer = attempt.answers[question.id];
    const points = question.points;
    const difficulty = question.difficulty;

    // Update difficulty total points
    diffStats[difficulty].totalPoints += points;
    diffStats[difficulty].count += 1;

    // Update category total points
    const catEntry = categoryMap.get(question.category) || {
      totalPoints: 0,
      scoredPoints: 0,
      count: 0,
    };
    catEntry.totalPoints += points;
    catEntry.count += 1;

    if (question.type === "mcq") {
      const mcqKey = sealed.mcqKeys[question.id];
      const selected = userAnswer?.selectedOptionId;

      if (!selected) {
        unansweredCount++;
        questionResults[question.id] = {
          questionId: question.id,
          type: "mcq",
          points,
          scoreAwarded: 0,
          isCorrect: false,
          correctOptionId: mcqKey?.correctOptionId || "A",
          explanation: mcqKey?.explanation || "",
        };
      } else {
        completedCount++;
        const isCorrect = selected === mcqKey?.correctOptionId;
        const scoreAwarded = isCorrect ? points : 0;

        if (isCorrect) {
          correctCount++;
          diffStats[difficulty].correctCount += 1;
        } else {
          wrongCount++;
        }

        totalScore += scoreAwarded;
        diffStats[difficulty].scoredPoints += scoreAwarded;
        catEntry.scoredPoints += scoreAwarded;

        questionResults[question.id] = {
          questionId: question.id,
          type: "mcq",
          points,
          scoreAwarded,
          isCorrect,
          selectedOptionId: selected,
          correctOptionId: mcqKey?.correctOptionId || "A",
          explanation: mcqKey?.explanation || "",
        };
      }
    } else {
      // Written question
      const rubric = sealed.writtenRubrics[question.id] || {
        questionId: question.id,
        expectedCriteria: [],
        importantConcepts: [],
        maxScore: points,
      };

      const writtenText = userAnswer?.writtenResponse?.trim();

      if (!writtenText) {
        unansweredCount++;
        questionResults[question.id] = {
          questionId: question.id,
          type: "written",
          points,
          scoreAwarded: 0,
          isCorrect: false,
          writtenResponse: "",
          evaluation: {
            questionId: question.id,
            score: 0,
            maxScore: points,
            dimensionScores: {
              correctness: 0,
              completeness: 0,
              technicalUnderstanding: 0,
              relevance: 0,
              clarity: 0,
            },
            whatWasCorrect: [],
            whatWasMissing: rubric.expectedCriteria,
            mistakes: ["No written response provided."],
            suggestedBetterAnswer: `A strong answer should demonstrate ${rubric.importantConcepts.join(", ")}.`,
            confidence: 1.0,
          },
        };
      } else {
        completedCount++;
        // Evaluate written answer with structured AI output
        const evaluation = await provider.evaluateWrittenAnswer({
          question,
          rubric,
          answer: writtenText,
          maxScore: points,
          language: attempt.setup.language,
        });

        // Deterministically clamp score between 0 and question points
        const clampedScore = Math.min(
          points,
          Math.max(0, Math.round(evaluation.score))
        );

        const isGoodAnswer = clampedScore >= points * 0.7;
        if (isGoodAnswer) {
          correctCount++;
          diffStats[difficulty].correctCount += 1;
        } else {
          wrongCount++;
        }

        totalScore += clampedScore;
        diffStats[difficulty].scoredPoints += clampedScore;
        catEntry.scoredPoints += clampedScore;

        questionResults[question.id] = {
          questionId: question.id,
          type: "written",
          points,
          scoreAwarded: clampedScore,
          isCorrect: isGoodAnswer,
          writtenResponse: writtenText,
          evaluation: {
            ...evaluation,
            score: clampedScore,
          },
        };
      }
    }

    categoryMap.set(question.category, catEntry);
  }

  // 3. Final score bounds assertion (deterministic sum 0..100)
  totalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // 4. Calculate timing metadata
  const startedMs = new Date(attempt.startedAt).getTime();
  const submittedMs = attempt.submittedAt
    ? new Date(attempt.submittedAt).getTime()
    : Date.now();
  const timeUsedSeconds = Math.max(
    0,
    Math.min(
      attempt.setup.durationMinutes * 60,
      Math.round((submittedMs - startedMs) / 1000)
    )
  );

  // 5. Build category analytics
  const categoryAnalytics: CategoryAnalytics[] = Array.from(
    categoryMap.entries()
  ).map(([category, data]) => ({
    category,
    totalPoints: data.totalPoints,
    scoredPoints: data.scoredPoints,
    percentage:
      data.totalPoints > 0
        ? Math.round((data.scoredPoints / data.totalPoints) * 100)
        : 0,
    count: data.count,
  }));

  // 6. Synthesize AI Final Feedback
  const statsSummary = `
- Final Score: ${totalScore}/100
- MCQ & Written: ${completedCount} answered, ${unansweredCount} unanswered
- Difficulty: Easy: ${diffStats.easy.scoredPoints}/${diffStats.easy.totalPoints}, Medium: ${diffStats.medium.scoredPoints}/${diffStats.medium.totalPoints}, Hard: ${diffStats.hard.scoredPoints}/${diffStats.hard.totalPoints}
- Categories: ${categoryAnalytics.map((c) => `${c.category} (${c.percentage}%)`).join(", ")}
`.trim();

  let feedback;
  if (options?.skipAIFeedback) {
    feedback = {
      overallPerformance: `Score achieved: ${totalScore}/100.`,
      strengths: ["Completed examination"],
      weaknesses: ["Review missed questions"],
      commonMistakes: [],
      topicsToImprove: categoryAnalytics.filter((c) => c.percentage < 70).map((c) => c.category),
      interviewReadiness: totalScore >= 70 ? "Ready" : "Needs Revision",
      studyAdvice: ["Review key concepts"],
      nextAttemptAdvice: "Practice with timed simulations",
    };
  } else {
    feedback = await provider.generateFinalFeedback({
      jobTitle: attempt.setup.jobTitle,
      level: attempt.setup.experienceLevel,
      totalScore,
      timeUsedSeconds,
      statsSummary,
      language: attempt.setup.language,
    });
  }

  const result: ExamResult = {
    attemptId: attempt.id,
    totalScore,
    totalPoints: 100,
    correctCount,
    wrongCount,
    unansweredCount,
    completedCount,
    timeUsedSeconds,
    status: totalScore >= 70 ? "passed" : "needs_work",
    difficultyAnalytics: diffStats,
    categoryAnalytics,
    questionResults,
    feedback,
    gradedAt: new Date().toISOString(),
  };

  return result;
}
