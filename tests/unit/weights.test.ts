import { describe, it, expect } from "vitest";
import { normalizeWeights, WeightInputItem } from "@/exam/weights";

describe("100-Point Weight Normalization (F009)", () => {
  it("normalizes a 5-question exam so sum of points equals exactly 100", () => {
    const items: WeightInputItem[] = [
      { id: "1", difficulty: "easy", type: "mcq" },
      { id: "2", difficulty: "medium", type: "mcq" },
      { id: "3", difficulty: "hard", type: "mcq" },
      { id: "4", difficulty: "medium", type: "written" },
      { id: "5", difficulty: "hard", type: "written" },
    ];

    const weightMap = normalizeWeights(items);

    expect(weightMap.size).toBe(5);

    let total = 0;
    for (const [id, points] of weightMap.entries()) {
      expect(points).toBeGreaterThanOrEqual(1);
      total += points;
    }

    expect(total).toBe(100);
  });

  it("handles various question counts from 3 to 30", () => {
    for (const count of [3, 7, 10, 13, 17, 20, 25, 30]) {
      const items: WeightInputItem[] = Array.from({ length: count }, (_, i) => ({
        id: `q_${i}`,
        difficulty: i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard",
        type: i % 2 === 0 ? "mcq" : "written",
      }));

      const weightMap = normalizeWeights(items);
      let sum = 0;
      for (const [, pts] of weightMap.entries()) {
        expect(pts).toBeGreaterThanOrEqual(1);
        sum += pts;
      }
      expect(sum).toBe(100);
    }
  });

  it("respects custom positive raw weights deterministically", () => {
    const items: WeightInputItem[] = [
      { id: "1", difficulty: "easy", type: "mcq", rawWeight: 10 },
      { id: "2", difficulty: "medium", type: "mcq", rawWeight: 20 },
      { id: "3", difficulty: "hard", type: "mcq", rawWeight: 70 },
    ];

    const weightMap = normalizeWeights(items);
    expect(weightMap.get("1")).toBe(10);
    expect(weightMap.get("2")).toBe(20);
    expect(weightMap.get("3")).toBe(70);

    const sum = Array.from(weightMap.values()).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });
});
