import { env } from "@/lib/config/env";
import { AIProvider } from "./types";
import { GeminiProvider } from "./gemini";
import { OfflineMockProvider } from "./offline";

let providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (providerInstance) {
    return providerInstance;
  }

  if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0) {
    providerInstance = new GeminiProvider();
  } else {
    providerInstance = new OfflineMockProvider();
  }

  return providerInstance;
}

export * from "./types";
export * from "./offline";
export * from "./gemini";
