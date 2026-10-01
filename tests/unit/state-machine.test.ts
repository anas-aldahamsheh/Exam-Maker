import { describe, it, expect } from "vitest";
import {
  canTransition,
  assertTransition,
  canModifyAnswers,
  isExamLocked,
} from "@/exam/state-machine";

describe("Exam State Machine (F011, F012)", () => {
  it("allows valid forward lifecycle transitions", () => {
    expect(canTransition("SETUP", "GENERATING")).toBe(true);
    expect(canTransition("GENERATING", "READY")).toBe(true);
    expect(canTransition("READY", "ACTIVE")).toBe(true);
    expect(canTransition("ACTIVE", "SUBMITTING")).toBe(true);
    expect(canTransition("SUBMITTING", "SUBMITTED")).toBe(true);
    expect(canTransition("SUBMITTED", "GRADING")).toBe(true);
    expect(canTransition("GRADING", "COMPLETED")).toBe(true);
  });

  it("forbids illegal regressions (e.g. COMPLETED -> ACTIVE)", () => {
    expect(canTransition("COMPLETED", "ACTIVE")).toBe(false);
    expect(canTransition("SUBMITTED", "ACTIVE")).toBe(false);
    expect(canTransition("GRADING", "ACTIVE")).toBe(false);

    expect(() => assertTransition("COMPLETED", "ACTIVE")).toThrow(
      /Forbidden state transition/
    );
  });

  it("is idempotent for same state", () => {
    expect(canTransition("SUBMITTED", "SUBMITTED")).toBe(true);
    expect(canTransition("ACTIVE", "ACTIVE")).toBe(true);
  });

  it("prevents answer modification when exam is submitted or expired", () => {
    expect(canModifyAnswers("ACTIVE", false)).toBe(true);
    expect(canModifyAnswers("ACTIVE", true)).toBe(false); // Expired
    expect(canModifyAnswers("SUBMITTED", false)).toBe(false);
    expect(canModifyAnswers("COMPLETED", false)).toBe(false);
  });

  it("identifies locked examination states", () => {
    expect(isExamLocked("ACTIVE")).toBe(false);
    expect(isExamLocked("SUBMITTING")).toBe(true);
    expect(isExamLocked("SUBMITTED")).toBe(true);
    expect(isExamLocked("COMPLETED")).toBe(true);
  });
});
