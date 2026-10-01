import { z } from "zod";

export const mcqOptionSchema = z.object({
  id: z.enum(["A", "B", "C", "D"]),
  text: z.string().min(1, "Option text cannot be empty"),
});

export const generatedQuestionItemSchema = z
  .object({
    id: z.string().min(1),
    type: z.enum(["mcq", "written"]),
    question: z.string().min(10, "Question prompt is too short"),
    difficulty: z.enum(["easy", "medium", "hard"]),
    category: z.string().min(2, "Category name is required"),
    rawWeight: z.number().positive().optional().default(1),
    options: z.array(mcqOptionSchema).optional(),
    correctOptionId: z.enum(["A", "B", "C", "D"]).optional(),
    explanation: z.string().optional(),
    writtenCriteria: z.array(z.string().min(3)).optional(),
    importantConcepts: z.array(z.string().min(2)).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "mcq") {
      if (!data.options || data.options.length !== 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MCQ question must have exactly 4 options (A, B, C, D)",
          path: ["options"],
        });
      } else {
        const ids = data.options.map((o) => o.id);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== 4) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "MCQ option IDs must be unique (A, B, C, D)",
            path: ["options"],
          });
        }
      }

      if (!data.correctOptionId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MCQ question must specify a correctOptionId",
          path: ["correctOptionId"],
        });
      }

      if (!data.explanation || data.explanation.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "MCQ question must include an explanation for review",
          path: ["explanation"],
        });
      }
    }

    if (data.type === "written") {
      if (!data.writtenCriteria || data.writtenCriteria.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Written question must provide written evaluation criteria",
          path: ["writtenCriteria"],
        });
      }

      if (!data.importantConcepts || data.importantConcepts.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Written question must specify important technical concepts",
          path: ["importantConcepts"],
        });
      }
    }
  });

export const generatedExamPayloadSchema = z.object({
  examTitle: z.string().min(3, "Exam title is required"),
  questions: z.array(generatedQuestionItemSchema).min(1, "At least one question is required"),
});

export type GeneratedExamPayload = z.infer<typeof generatedExamPayloadSchema>;
export type GeneratedQuestionItem = z.infer<typeof generatedQuestionItemSchema>;
