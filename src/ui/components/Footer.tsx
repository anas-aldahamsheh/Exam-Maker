"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/ui/providers/I18nProvider";
import { Phone, GraduationCap } from "lucide-react";

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66c0-.92-.74-1.66-1.66-1.66Z" />
    </svg>
  );
}

export function Footer() {
  const { locale, dict } = useI18n();

  return (
    <footer className="mt-auto border-t border-stone-200 bg-white/95 dark:border-stone-800 dark:bg-stone-950/95 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand & Creator Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-[#f5e4b3] via-[#e8c676] to-[#daa945] text-stone-950 font-bold shadow-sm shadow-[#e8c676]/20 border border-[#fbf3d5]/70 shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-stone-900 dark:text-stone-100">
                  <span className="text-[#b58c1c] dark:text-[#e8c676] font-bold">Pro</span> Interview Exam
                </h3>
                <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  {locale === "ar" ? "تطوير: أنس الدحامشة" : "Engineered by Anas Aldahamsheh"}
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              {locale === "ar"
                ? "منصة احترافية لاختبارات المقابلات التقنية تحاكي معايير كبرى الشركات مع تقييم منهجي شامل دون انحياز."
                : "A rigorous technical interview simulation platform designed for real-world hiring standards and objective evaluation."}
            </p>
          </div>

          {/* Developer Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-400 dark:text-stone-500">
              {locale === "ar" ? "بيانات التواصل المباشر" : "Direct Contact"}
            </h4>
            <div className="flex flex-col items-start gap-2.5 text-xs">
              {/* Phone */}
              <a
                href="tel:+962789495167"
                className="group inline-flex items-center gap-2.5 font-medium text-stone-700 transition-colors hover:text-[#b58c1c] dark:text-stone-300 dark:hover:text-[#e8c676]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8c676]/10 text-[#b58c1c] transition group-hover:bg-[#e8c676]/20 dark:text-[#e8c676]">
                  <Phone className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span dir="ltr" className="font-mono text-xs">+962 789 495 167</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/in/anas-aldahamsheh"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5 font-medium text-stone-700 transition-colors hover:text-[#b58c1c] dark:text-stone-300 dark:hover:text-[#e8c676]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8c676]/10 text-[#b58c1c] transition group-hover:bg-[#e8c676]/20 dark:text-[#e8c676]">
                  <LinkedinIcon className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span dir="ltr" className="font-mono text-xs">linkedin.com/in/anas-aldahamsheh</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-stone-400 dark:text-stone-500">
              {locale === "ar" ? "روابط سريعة" : "Navigation"}
            </h4>
            <div className="flex flex-col gap-2 text-xs font-medium">
              <Link
                href={`/${locale}`}
                className="text-stone-600 hover:text-[#b58c1c] dark:text-stone-400 dark:hover:text-[#e8c676] transition-colors"
              >
                {locale === "ar" ? "الصفحة الرئيسية" : "Home"}
              </Link>
              <Link
                href={`/${locale}/setup`}
                className="text-stone-600 hover:text-[#b58c1c] dark:text-stone-400 dark:hover:text-[#e8c676] transition-colors"
              >
                {locale === "ar" ? "إعداد اختبار جديد" : "New Exam Setup"}
              </Link>
              <Link
                href={`/${locale}/history`}
                className="text-stone-600 hover:text-[#b58c1c] dark:text-stone-400 dark:hover:text-[#e8c676] transition-colors"
              >
                {locale === "ar" ? "سجل الاختبارات والنتائج" : "Exam History"}
              </Link>
              <Link
                href={`/${locale}/compare`}
                className="text-stone-600 hover:text-[#b58c1c] dark:text-stone-400 dark:hover:text-[#e8c676] transition-colors"
              >
                {locale === "ar" ? "مقارنة المحاولات" : "Compare Attempts"}
              </Link>
              <Link
                href={`/${locale}/privacy`}
                className="text-stone-600 hover:text-[#b58c1c] dark:text-stone-400 dark:hover:text-[#e8c676] transition-colors"
              >
                {locale === "ar" ? "معايير الأمان والخصوصية" : "Privacy & Security"}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 border-t border-stone-200 dark:border-stone-800 pt-5 text-center text-xs text-stone-500 dark:text-stone-400 sm:text-start flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © 2026 <strong>Anas Aldahamsheh</strong>. {locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
          <p className="text-[11px] text-stone-400 dark:text-stone-500">
            {locale === "ar"
              ? "منصة المقابلات التقنية الاحترافية • خصوصية تامة وحفظ محلي آمن"
              : "Professional Technical Interview Platform • Private & Locally Stored"}
          </p>
        </div>
      </div>
    </footer>
  );
}
