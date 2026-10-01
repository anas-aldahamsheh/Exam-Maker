import { en, Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";

export type Locale = "en" | "ar";
export type { Dictionary };

export const defaultLocale: Locale = "en";
export const supportedLocales: Locale[] = ["en", "ar"];

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ar,
};

export function getDictionary(locale: string | undefined): Dictionary {
  if (locale === "ar") return dictionaries.ar;
  return dictionaries.en;
}

export function isRtlLocale(locale: string | undefined): boolean {
  return locale === "ar";
}

export function isValidLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}
