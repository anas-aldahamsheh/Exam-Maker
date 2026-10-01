import { describe, it, expect } from "vitest";

function calculateRemainingMs(endAtIso: string, nowMs: number): number {
  const endMs = new Date(endAtIso).getTime();
  return Math.max(0, endMs - nowMs);
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

describe("Authoritative Timer Logic (F017, F018, F021)", () => {
  it("calculates remaining time accurately based on absolute timestamps", () => {
    const start = new Date("2026-01-01T12:00:00Z").getTime();
    const durationMs = 15 * 60 * 1000; // 15 mins
    const endAtIso = new Date(start + durationMs).toISOString();

    // 5 minutes in
    const now5m = start + 5 * 60 * 1000;
    const remaining5m = calculateRemainingMs(endAtIso, now5m);
    expect(remaining5m).toBe(10 * 60 * 1000);
    expect(formatTime(remaining5m)).toBe("10:00");

    // Exact expiry
    const nowEnd = start + durationMs;
    const remainingEnd = calculateRemainingMs(endAtIso, nowEnd);
    expect(remainingEnd).toBe(0);
    expect(formatTime(remainingEnd)).toBe("00:00");

    // Past expiry (should clamp to 0, never negative)
    const nowPast = start + durationMs + 10000;
    const remainingPast = calculateRemainingMs(endAtIso, nowPast);
    expect(remainingPast).toBe(0);
  });

  it("survives background tab suspension by evaluating against real wall-clock time", () => {
    const start = Date.now();
    const endAtIso = new Date(start + 30 * 60 * 1000).toISOString();

    // Simulate tab waking up 20 minutes later
    const simulatedWakeupTime = start + 20 * 60 * 1000;
    const remaining = calculateRemainingMs(endAtIso, simulatedWakeupTime);

    // Remaining should be exactly 10 minutes, not 30 minutes!
    expect(remaining).toBe(10 * 60 * 1000);
    expect(formatTime(remaining)).toBe("10:00");
  });

  it("detects 5-minute and 1-minute warning thresholds", () => {
    const is5MinWarning = (remainingMs: number) =>
      remainingMs <= 5 * 60 * 1000 && remainingMs > 1 * 60 * 1000;
    const is1MinWarning = (remainingMs: number) =>
      remainingMs <= 1 * 60 * 1000 && remainingMs > 0;

    expect(is5MinWarning(6 * 60 * 1000)).toBe(false);
    expect(is5MinWarning(4 * 60 * 1000)).toBe(true);
    expect(is5MinWarning(50 * 1000)).toBe(false);

    expect(is1MinWarning(70 * 1000)).toBe(false);
    expect(is1MinWarning(45 * 1000)).toBe(true);
    expect(is1MinWarning(0)).toBe(false);
  });
});
