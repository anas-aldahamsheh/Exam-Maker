"use client";

import React, { createContext, useContext } from "react";
import { Dictionary, Locale, getDictionary, isRtlLocale } from "@/lib/i18n";

interface I18nContextType {
  locale: Locale;
  dict: Dictionary;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dict = getDictionary(locale);
  const isRTL = isRtlLocale(locale);

  return (
    <I18nContext.Provider value={{ locale, dict, isRTL }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
