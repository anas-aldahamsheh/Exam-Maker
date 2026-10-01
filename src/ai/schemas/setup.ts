import { z } from "zod";

export const examSetupSchema = z.object({
  jobTitle: z
    .string()
    .trim()
    .min(3, "Job title must be at least 3 characters")
    .max(100, "Job title must not exceed 100 characters"),
  jobDescription: z
    .string()
    .trim()
    .max(4000, "Job description must not exceed 4,000 characters")
    .optional()
    .or(z.literal("")),
  experienceLevel: z.enum(["junior", "mid", "senior"]),
  questionType: z.enum(["mcq", "written", "mixed"]),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  questionCount: z
    .number()
    .int()
    .min(3, "Minimum question count is 3")
    .max(30, "Maximum question count is 30"),
  durationMinutes: z
    .number()
    .int()
    .min(5, "Minimum duration is 5 minutes")
    .max(180, "Maximum duration is 180 minutes"),
  language: z.enum(["ar", "en"]).default("en"),
});

export type ExamSetupFormData = z.infer<typeof examSetupSchema>;
