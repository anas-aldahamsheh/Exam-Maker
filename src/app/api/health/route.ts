import { NextResponse } from "next/server";
import { getAIProvider } from "@/ai/providers";

export async function GET() {
  const provider = getAIProvider();

  return NextResponse.json({
    status: "ok",
    app: "ai-interview-exam-simulator",
    version: "1.0.0",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    aiProvider: provider.name,
  });
}
