"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CompletedAttemptRecord } from "@/persistence/indexeddb/database";
import {
  getAllCompletedAttempts,
} from "@/persistence/repositories/examRepository";
import { useI18n } from "@/ui/providers/I18nProvider";
import { Card } from "@/ui/primitives/Card";
import { Button } from "@/ui/primitives/Button";
import { Badge } from "@/ui/primitives/Badge";
import { ProgressBar } from "@/ui/primitives/ProgressBar";
import {
  GitCompare,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Clock,
  Calendar,
} from "lucide-react";
import { clsx } from "clsx";

export function CompareView() {
  const { locale, dict, isRTL } = useI18n();
  const searchParams = useSearchParams();

  const [allRecords, setAllRecords] = useState<CompletedAttemptRecord[]>([]);
  const [selectedAttempts, setSelectedAttempts] = useState<CompletedAttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  useEffect(() => {
    async function loadAttempts() {
      setLoading(true);
      const history = await getAllCompletedAttempts();
      setAllRecords(history);

      const attemptParam = searchParams.get("attempts");
      if (attemptParam) {
        const ids = attemptParam.split(",");
        const matched = history.filter((r) => ids.includes(r.id));
        if (matched.length >= 2) {
          setSelectedAttempts(matched.slice(0, 3));
        } else if (history.length >= 2) {
          setSelectedAttempts(history.slice(0, 2));
        }
      } else if (history.length >= 2) {
        setSelectedAttempts(history.slice(0, 2));
      }

      setLoading(false);
    }

    loadAttempts();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8 text-center text-stone-500">
        {dict.common.loading}
      </div>
    );
  }

  if (allRecords.length < 2) {
    return (
      <Card padding="lg" className="max-w-lg mx-auto my-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676] flex items-center justify-center mx-auto">
          <GitCompare className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          {dict.compare.title}
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {dict.compare.noComparison}
        </p>
        <div className="pt-2">
          <Link href={`/${locale}/setup`}>
            <Button size="md">
              <span>{dict.common.home}</span>
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // Calculate overlapping categories between selected attempts
  const attemptA = selectedAttempts[0];
  const attemptB = selectedAttempts[1];

  let sharedCategories: string[] = [];
  if (attemptA && attemptB) {
    const catsA = new Set(attemptA.result.categoryAnalytics.map((c) => c.category));
    sharedCategories = attemptB.result.categoryAnalytics
      .map((c) => c.category)
      .filter((c) => catsA.has(c));
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 text-start py-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <GitCompare className="h-7 w-7 text-[#b58c1c] dark:text-[#e8c676]" />
            <span>{dict.compare.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {dict.compare.subtitle}
          </p>
        </div>

        <Link href={`/${locale}/history`}>
          <Button variant="outline" size="sm">
            <ArrowIcon className="h-4 w-4 me-1.5" />
            <span>{dict.compare.backToHistory}</span>
          </Button>
        </Link>
      </div>

      {/* Side-by-side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedAttempts.map((record, index) => {
          const isPassed = record.result.totalScore >= 70;
          const dateStr = new Date(record.completedAt).toLocaleDateString(
            locale === "ar" ? "ar-EG" : "en-US",
            { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
          );

          return (
            <Card
              key={record.id}
              padding="lg"
              className="space-y-5 border-stone-200/90 dark:border-stone-800 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                <Badge variant="primary" size="sm">
                  Attempt #{index + 1}
                </Badge>
                <span className="text-xs text-stone-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {dateStr}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">
                  {record.attempt.setup.jobTitle}
                </h3>
                <p className="text-xs text-stone-500 capitalize">
                  {record.attempt.setup.experienceLevel} level &bull; {record.attempt.questions.length} questions
                </p>
              </div>

              {/* Score display */}
              <div className="p-4 rounded-xl bg-stone-50/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
                <span className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                  Final Score:
                </span>
                <div className="flex items-baseline gap-1">
                  <span
                    className={clsx(
                      "text-3xl font-black numeric-ltr",
                      isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-[#b58c1c] dark:text-[#e8c676]"
                    )}
                  >
                    {record.result.totalScore}
                  </span>
                  <span className="text-xs text-stone-400 font-bold">/100</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800">
                  <span className="text-stone-400">Correct</span>
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    {record.result.correctCount}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800">
                  <span className="text-stone-400">Time Used</span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 numeric-ltr">
                    {Math.round(record.result.timeUsedSeconds / 60)}m
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-stone-50/80 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800">
                  <span className="text-stone-400">Status</span>
                  <p className={clsx("font-bold capitalize", isPassed ? "text-emerald-600 dark:text-emerald-400" : "text-[#b58c1c] dark:text-[#e8c676]")}>
                    {record.result.status.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link href={`/${locale}/results/${record.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    <span>View Full Details</span>
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Shared Categories Performance Comparison */}
      {sharedCategories.length > 0 && attemptA && attemptB && (
        <Card padding="lg" className="space-y-4">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#b58c1c] dark:text-[#e8c676]" />
            <span>{dict.compare.categoryComparison}</span>
          </h3>

          <div className="space-y-4 pt-2">
            {sharedCategories.map((category) => {
              const catA = attemptA.result.categoryAnalytics.find((c) => c.category === category);
              const catB = attemptB.result.categoryAnalytics.find((c) => c.category === category);

              const percentA = catA?.percentage ?? 0;
              const percentB = catB?.percentage ?? 0;
              const diff = percentB - percentA;

              return (
                <div key={category} className="p-3.5 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-stone-800 dark:text-stone-200">{category}</span>
                    <span
                      className={clsx(
                        "font-bold numeric-ltr",
                        diff > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : diff < 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-stone-400"
                      )}
                    >
                      {diff > 0 ? `+${diff}%` : diff < 0 ? `${diff}%` : "0%"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                        <span>Attempt 1</span>
                        <span className="numeric-ltr">{percentA}%</span>
                      </div>
                      <ProgressBar value={percentA} variant={percentA >= 70 ? "success" : "warning"} />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] text-stone-500 mb-1">
                        <span>Attempt 2</span>
                        <span className="numeric-ltr">{percentB}%</span>
                      </div>
                      <ProgressBar value={percentB} variant={percentB >= 70 ? "success" : "warning"} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
