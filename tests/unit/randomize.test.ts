import { describe, it, expect } from "vitest";
import { shuffleOptions } from "@/exam/generation/randomize";
import { QuestionOption } from "@/types/exam";

describe("MCQ Option Randomization (F039)", () => {
  const originalOptions: QuestionOption[] = [
    { id: "A", text: "Option A" },
    { id: "B", text: "Option B" },
    { id: "C", text: "Option C" },
    { id: "D", text: "Option D" },
  ];

  it("preserves all option objects and their immutable IDs", () => {
    const shuffled = shuffleOptions(originalOptions);

    expect(shuffled.length).toBe(4);
    const ids = shuffled.map((o) => o.id).sort();
    expect(ids).toEqual(["A", "B", "C", "D"]);

    for (const opt of shuffled) {
      const original = originalOptions.find((o) => o.id === opt.id);
      expect(original?.text).toBe(opt.text);
    }
  });
});
