import React from "react";
import { Locale, isRtlLocale, supportedLocales } from "@/lib/i18n";
import { I18nProvider } from "@/ui/providers/I18nProvider";
import { Navbar } from "@/ui/components/Navbar";
import { Footer } from "@/ui/components/Footer";

export async function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = (resolvedParams.locale === "ar" ? "ar" : "en") as Locale;
  const isRTL = isRtlLocale(locale);

  return (
    <I18nProvider locale={locale}>
      <div
        dir={isRTL ? "rtl" : "ltr"}
        lang={locale}
        className="min-h-screen flex flex-col bg-ambient text-stone-900 dark:text-stone-100 relative overflow-x-hidden"
      >
        <div className="fixed inset-0 bg-grid-glow pointer-events-none z-0 opacity-70" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </I18nProvider>
  );
}
