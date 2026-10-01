import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/config/env";
import {
  ExamSetup,
  PublicQuestion,
  WrittenRubric,
  WrittenEvaluation,
  AIFinalFeedback,
} from "@/types/exam";
import {
  GeneratedExamPayload,
  generatedExamPayloadSchema,
} from "@/ai/schemas/exam";
import {
  buildExamGenerationPrompt,
  buildWrittenEvaluationPrompt,
  buildFinalFeedbackPrompt,
  buildPracticeExamPrompt,
} from "@/ai/prompts/templates";
import { AIProvider, FinalFeedbackInput } from "./types";

function parseGeminiJsonResponse(raw: string): any {
  const text = (raw || "").trim();

  const tryParse = (str: string) => {
    try {
      return JSON.parse(str);
    } catch {
      // Remove trailing commas before closing braces/brackets if present
      const cleaned = str.replace(/,\s*([\]}])/g, "$1");
      return JSON.parse(cleaned);
    }
  };

  // 1. First attempt: direct JSON parse
  try {
    return tryParse(text);
  } catch {}

  // 2. Extract code block if enclosed in ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    try {
      return tryParse(codeBlockMatch[1].trim());
    } catch {}
  }

  // 3. Scan for balanced outermost JSON object { ... }
  const start = text.indexOf("{");
  if (start !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = start; i < text.length; i++) {
      const char = text[i];

      if (escape) {
        escape = false;
        continue;
      }

      if (char === "\\") {
        escape = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === "{") {
          depth++;
        } else if (char === "}") {
          depth--;
          if (depth === 0) {
            const candidate = text.substring(start, i + 1);
            try {
              return tryParse(candidate);
            } catch {}
          }
        }
      }
    }

    // 4. Fallback between first { and last }
    const end = text.lastIndexOf("}");
    if (end > start) {
      const candidate = text.substring(start, end + 1);
      try {
        return tryParse(candidate);
      } catch {}
    }
  }

  throw new Error(
    `Failed to extract valid JSON from Gemini response. Preview: ${text.slice(0, 300)}`
  );
}

function getGeminiApiKey(): string {
  return (process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || "").trim();
}

function getGeminiModel(): string {
  return (process.env.GEMINI_MODEL || env.GEMINI_MODEL || "gemini-3.1-flash-lite").trim();
}

function normalizeExamPayload(parsed: any, defaultDifficulty: string, targetCount: number): any {
  if (!parsed || typeof parsed !== "object") return parsed;

  const examTitle = String(parsed.examTitle || parsed.title || "Technical Assessment Examination");
  const rawQuestions = Array.isArray(parsed.questions) ? parsed.questions : [];

  const questions = rawQuestions.map((q: any, index: number) => {
    const rawType = String(q.type || q.questionType || (q.options && q.options.length > 0 ? "mcq" : "written")).toLowerCase();
    const type = rawType.includes("mcq") || rawType.includes("choice") ? "mcq" : "written";

    const rawDiff = String(q.difficulty || "").toLowerCase();
    const difficulty = ["easy", "medium", "hard"].includes(rawDiff)
      ? rawDiff
      : defaultDifficulty === "mixed"
      ? (index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard")
      : (["easy", "medium", "hard"].includes(defaultDifficulty) ? defaultDifficulty : "medium");

    const category = String(q.category || q.technicalCategory || q.domain || "Technical Knowledge");
    const question = String(q.question || q.questionText || q.prompt || "Engineering Assessment Scenario");
    const rawWeight = typeof q.rawWeight === "number" && q.rawWeight > 0 ? q.rawWeight : (difficulty === "hard" ? 3 : 2);

    if (type === "mcq") {
      let options = Array.isArray(q.options)
        ? q.options.map((opt: any, optIdx: number) => {
            const letter = (["A", "B", "C", "D"][optIdx] || "A") as "A" | "B" | "C" | "D";
            const optId = String(opt.id || letter).toUpperCase() as "A" | "B" | "C" | "D";
            return {
              id: ["A", "B", "C", "D"].includes(optId) ? optId : letter,
              text: String(opt.text || opt.option || `Option ${letter}`),
            };
          })
        : [];

      const letters: Array<"A" | "B" | "C" | "D"> = ["A", "B", "C", "D"];
      if (options.length !== 4) {
        options = letters.map((ltr, idx) => ({
          id: ltr,
          text: options[idx]?.text || `Technical approach alternative ${ltr}`,
        }));
      } else {
        options = options.map((opt: any, idx: number) => ({
          id: letters[idx],
          text: opt.text,
        }));
      }

      const rawCorrect = String(q.correctOptionId || "A").toUpperCase();
      const correctOptionId = ["A", "B", "C", "D"].includes(rawCorrect) ? (rawCorrect as "A" | "B" | "C" | "D") : "A";
      const explanation = String(q.explanation || "This option represents the industry standard engineering solution for this scenario.");

      return {
        id: String(q.id || `q_${index + 1}`),
        type: "mcq" as const,
        question,
        difficulty: difficulty as "easy" | "medium" | "hard",
        category,
        rawWeight,
        options,
        correctOptionId,
        explanation,
      };
    } else {
      const writtenCriteria = Array.isArray(q.writtenCriteria) && q.writtenCriteria.length > 0
        ? q.writtenCriteria.map(String)
        : ["Clear system architecture and design", "Analysis of edge-case trade-offs and performance", "Resilience and error-handling strategy"];

      const importantConcepts = Array.isArray(q.importantConcepts) && q.importantConcepts.length > 0
        ? q.importantConcepts.map(String)
        : ["Architecture", "Concurrency", "Trade-offs"];

      return {
        id: String(q.id || `q_${index + 1}`),
        type: "written" as const,
        question,
        difficulty: difficulty as "easy" | "medium" | "hard",
        category,
        rawWeight: rawWeight * 1.5,
        writtenCriteria,
        importantConcepts,
      };
    }
  });

  return {
    examTitle,
    questions: questions.slice(0, targetCount),
  };
}

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private client: GoogleGenAI | null = null;

  constructor() {
    const key = getGeminiApiKey();
    if (key.length > 0) {
      try {
        this.client = new GoogleGenAI({ apiKey: key });
      } catch (err) {
        throw new Error(`Failed to initialize Google GenAI client: ${(err as Error).message}`);
      }
    }
  }

  private ensureClient(): GoogleGenAI {
    if (!this.client) {
      const key = getGeminiApiKey();
      if (key.length > 0) {
        this.client = new GoogleGenAI({ apiKey: key });
        return this.client;
      }
      throw new Error(
        "Gemini API key is not configured. Please set GEMINI_API_KEY in .env.local to enable real AI generation."
      );
    }
    return this.client;
  }

  async generateExam(setup: ExamSetup): Promise<GeneratedExamPayload> {
    const client = this.ensureClient();
    const prompt = buildExamGenerationPrompt(setup);
    const modelName = getGeminiModel();

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = parseGeminiJsonResponse(response.text || "");
    const normalized = normalizeExamPayload(parsed, setup.difficulty, setup.questionCount);
    const validated = generatedExamPayloadSchema.parse(normalized);

    return validated;
  }

  async evaluateWrittenAnswer(params: {
    question: PublicQuestion;
    rubric: WrittenRubric;
    answer: string;
    maxScore: number;
    language: "ar" | "en";
  }): Promise<WrittenEvaluation> {
    const client = this.ensureClient();
    const prompt = buildWrittenEvaluationPrompt(params);
    const modelName = getGeminiModel();

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const parsed = parseGeminiJsonResponse(response.text || "");

    const clampedScore = Math.min(
      params.maxScore,
      Math.max(0, Math.round(Number(parsed.score) || 0))
    );

    return {
      questionId: params.question.id,
      score: clampedScore,
      maxScore: params.maxScore,
      dimensionScores: {
        correctness: Math.min(10, Math.max(0, Number(parsed.dimensionScores?.correctness) || 0)),
        completeness: Math.min(10, Math.max(0, Number(parsed.dimensionScores?.completeness) || 0)),
        technicalUnderstanding: Math.min(10, Math.max(0, Number(parsed.dimensionScores?.technicalUnderstanding) || 0)),
        relevance: Math.min(10, Math.max(0, Number(parsed.dimensionScores?.relevance) || 0)),
        clarity: Math.min(10, Math.max(0, Number(parsed.dimensionScores?.clarity) || 0)),
      },
      whatWasCorrect: Array.isArray(parsed.whatWasCorrect) ? parsed.whatWasCorrect : [],
      whatWasMissing: Array.isArray(parsed.whatWasMissing) ? parsed.whatWasMissing : [],
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
      suggestedBetterAnswer: String(parsed.suggestedBetterAnswer || ""),
      confidence: Number(parsed.confidence) || 0.9,
    };
  }

  async generateFinalFeedback(input: FinalFeedbackInput): Promise<AIFinalFeedback> {
    const client = this.ensureClient();
    const prompt = buildFinalFeedbackPrompt(input);
    const modelName = getGeminiModel();

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = parseGeminiJsonResponse(response.text || "");

    return {
      overallPerformance: String(parsed.overallPerformance || ""),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      commonMistakes: Array.isArray(parsed.commonMistakes) ? parsed.commonMistakes : [],
      topicsToImprove: Array.isArray(parsed.topicsToImprove) ? parsed.topicsToImprove : [],
      interviewReadiness: String(parsed.interviewReadiness || ""),
      studyAdvice: Array.isArray(parsed.studyAdvice) ? parsed.studyAdvice : [],
      nextAttemptAdvice: String(parsed.nextAttemptAdvice || ""),
    };
  }

  async generatePracticeExam(params: {
    setup: ExamSetup;
    weakCategories: string[];
    missedConcepts: string[];
    count: number;
  }): Promise<GeneratedExamPayload> {
    const client = this.ensureClient();
    const prompt = buildPracticeExamPrompt(params);
    const modelName = getGeminiModel();

    const response = await client.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = parseGeminiJsonResponse(response.text || "");
    const normalized = normalizeExamPayload(parsed, params.setup.difficulty, params.count);
    const validated = generatedExamPayloadSchema.parse(normalized);
    return validated;
  }
}
