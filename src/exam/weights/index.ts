import { QuestionDifficulty, QuestionType } from "@/types/exam";

export interface WeightInputItem {
  id: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  rawWeight?: number;
}

export interface NormalizedWeightResult {
  id: string;
  points: number;
}

/**
 * Normalizes question weights so the total points equal exactly 100.
 * Guaranteed:
 * - Deterministic output for same input
 * - sum(points) === 100
 * - points >= 1 for every question
 * - Harder / Written questions can reflect proportional weights
 */
export function normalizeWeights(
  items: WeightInputItem[]
): Map<string, number> {
  const count = items.length;
  if (count === 0) {
    return new Map();
  }

  if (count > 100) {
    throw new Error("Cannot allocate 100 integer points across more than 100 questions");
  }

  // 1. Calculate effective raw weight for each item
  const rawWeights = items.map((item) => {
    if (typeof item.rawWeight === "number" && item.rawWeight > 0) {
      return item.rawWeight;
    }

    // Default weight based on difficulty
    const diffMultiplier =
      item.difficulty === "hard" ? 3 : item.difficulty === "medium" ? 2 : 1;

    // Written questions receive slightly higher weight in mixed assessments
    const typeMultiplier = item.type === "written" ? 1.5 : 1.0;

    return diffMultiplier * typeMultiplier;
  });

  const totalRaw = rawWeights.reduce((acc, w) => acc + w, 0);

  // 2. Compute float shares and initial floors
  const fractionalShares = rawWeights.map((w) => (w / totalRaw) * 100);
  const floorPoints = fractionalShares.map((f) => Math.max(1, Math.floor(f)));

  let currentTotal = floorPoints.reduce((acc, p) => acc + p, 0);
  let remainder = 100 - currentTotal;

  // 3. Compute remaining fractional fractions for distribution
  const remainders = fractionalShares.map((f, i) => ({
    index: i,
    remainder: f - floorPoints[i],
    difficulty: items[i].difficulty,
  }));

  // Sort by highest remainder, then by hardest difficulty
  remainders.sort((a, b) => {
    if (Math.abs(b.remainder - a.remainder) > 0.0001) {
      return b.remainder - a.remainder;
    }
    const diffScore = (d: QuestionDifficulty) =>
      d === "hard" ? 3 : d === "medium" ? 2 : 1;
    return diffScore(b.difficulty) - diffScore(a.difficulty);
  });

  // 4. Distribute positive remainder
  if (remainder > 0) {
    let rIdx = 0;
    while (remainder > 0) {
      const target = remainders[rIdx % count].index;
      floorPoints[target] += 1;
      remainder -= 1;
      rIdx++;
    }
  } else if (remainder < 0) {
    // If floors exceeded 100 (e.g. many questions forced to minimum 1)
    let rIdx = remainders.length - 1;
    while (remainder < 0 && rIdx >= 0) {
      const target = remainders[rIdx].index;
      if (floorPoints[target] > 1) {
        floorPoints[target] -= 1;
        remainder += 1;
      }
      rIdx--;
    }
  }

  // 5. Final assertion check
  const finalSum = floorPoints.reduce((acc, p) => acc + p, 0);
  if (finalSum !== 100) {
    throw new Error(`Weight normalization failed: total is ${finalSum}, expected 100`);
  }

  const resultMap = new Map<string, number>();
  items.forEach((item, i) => {
    resultMap.set(item.id, floorPoints[i]);
  });

  return resultMap;
}
