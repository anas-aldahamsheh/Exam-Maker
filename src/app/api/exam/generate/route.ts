import { NextRequest, NextResponse } from "next/server";
import { examSetupSchema } from "@/ai/schemas/setup";
import { synthesizeExam } from "@/exam/generation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedSetup = examSetupSchema.parse(body);

    const attempt = await synthesizeExam(validatedSetup);

    return NextResponse.json({
      success: true,
      attempt,
    });
  } catch (err: unknown) {
    console.error("Exam generation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: (err as Error).message || "Failed to generate exam",
      },
      { status: 400 }
    );
  }
}
