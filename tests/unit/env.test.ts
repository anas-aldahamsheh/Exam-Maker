import { describe, it, expect } from "vitest";
import { env } from "@/lib/config/env";

describe("Environment Validation (F001)", () => {
  it("loads and validates default environment variables", () => {
    expect(env).toBeDefined();
    expect(typeof env.EXAM_SEAL_SECRET).toBe("string");
    expect(env.EXAM_SEAL_SECRET.length).toBeGreaterThanOrEqual(16);
  });
});
