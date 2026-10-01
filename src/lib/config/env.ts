import { z } from "zod";

const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().optional().default(""),
  GEMINI_MODEL: z.string().optional().default("gemini-2.5-flash"),
  EXAM_SEAL_SECRET: z
    .string()
    .min(16, "EXAM_SEAL_SECRET must be at least 16 characters")
    .default("default-secret-exam-simulator-development-key-32-chars"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = serverEnvSchema.parse({
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
  EXAM_SEAL_SECRET: process.env.EXAM_SEAL_SECRET,
  NODE_ENV: process.env.NODE_ENV,
});
