import { describe, it, expect } from "vitest";
import { getDictionary, isRtlLocale, supportedLocales } from "@/lib/i18n";
import { en } from "@/lib/i18n/dictionaries/en";
import { ar } from "@/lib/i18n/dictionaries/ar";

describe("Bilingual Shell & RTL/LTR (F002, F003)", () => {
  it("supports en and ar locales", () => {
    expect(supportedLocales).toContain("en");
    expect(supportedLocales).toContain("ar");
  });

  it("determines RTL correctly", () => {
    expect(isRtlLocale("ar")).toBe(true);
    expect(isRtlLocale("en")).toBe(false);
    expect(isRtlLocale("unknown")).toBe(false);
  });

  it("ensures parity between English and Arabic dictionary keys", () => {
    const enSections = Object.keys(en) as (keyof typeof en)[];
    const arSections = Object.keys(ar) as (keyof typeof ar)[];

    expect(arSections.sort()).toEqual(enSections.sort());

    for (const section of enSections) {
      const enKeys = Object.keys(en[section]).sort();
      const arKeys = Object.keys(ar[section]).sort();
      expect(arKeys, `Section ${section} keys mismatch`).toEqual(enKeys);
    }
  });

  it("retrieves dictionary safely with fallbacks", () => {
    const enDict = getDictionary("en");
    expect(enDict.common.appName).toBe("Interview Assessment Platform");

    const arDict = getDictionary("ar");
    expect(arDict.common.appName).toContain("منصة تقييم المقابلات");

    const fallbackDict = getDictionary("invalid");
    expect(fallbackDict.common.appName).toBe("Interview Assessment Platform");
  });
});
