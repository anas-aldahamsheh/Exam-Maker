import { NextRequest, NextResponse } from "next/server";
import { ExamAttempt } from "@/types/exam";
import { gradeExamAttempt } from "@/exam/scoring";

export async function POST(req: NextRequest) {
  try {
    const attempt = (await req.json()) as ExamAttempt;

    if (!attempt || !attempt.id || !attempt.sealedToken) {
      return NextResponse.json(
        { success: false, error: "Invalid attempt payload or missing sealed token" },
        { status: 400 }
      );
    }

    // Grade attempt with deterministic code + AI written evaluation
    const result = await gradeExamAttempt(attempt);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: unknown) {
    console.error("Grading error:", err);
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message || "Failed to grade examination",
      },
      { status: 500 }
    );
  }
}
