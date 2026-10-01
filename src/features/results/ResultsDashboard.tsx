"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExamAttempt, ExamResult, CategoryAnalytics } from "@/types/exam";
import { useI18n } from "@/ui/providers/I18nProvider";
import { Card } from "@/ui/primitives/Card";
import { Button } from "@/ui/primitives/Button";
import { Badge } from "@/ui/primitives/Badge";
import { ProgressBar } from "@/ui/primitives/ProgressBar";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Target,
  FileText,
  History,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { clsx } from "clsx";

interface ResultsDashboardProps {
  attempt: ExamAttempt;
  result: ExamResult;
}

export function ResultsDashboard({ attempt, result }: ResultsDashboardProps) {
  const { locale, dict, isRTL } = useI18n();
  const router = useRouter();

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const isPassed = result.totalScore >= 70;
  const timeUsedMinutes = Math.max(1, Math.round(result.timeUsedSeconds / 60));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 text-start py-4">
      {/* Top Banner & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-4">
        <div>
          <Badge variant={isPassed ? "success" : "warning"} size="md" className="mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isPassed ? dict.results.outcomePassed : dict.results.outcomeReview}</span>
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50">
            {dict.results.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {attempt.setup.jobTitle} &bull; <span className="capitalize">{attempt.setup.experienceLevel}</span>
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/${locale}/review/${attempt.id}`}>
            <Button size="md" className="shadow-xs">
              <FileText className="h-4 w-4 me-1.5" />
              <span>{dict.results.reviewAnswersBtn}</span>
            </Button>
          </Link>
          <Link href={`/${locale}/history`}>
            <Button variant="outline" size="md">
              <History className="h-4 w-4 me-1.5 text-stone-500" />
              <span>{dict.results.historyBtn}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Score Card */}
      <Card padding="lg" className="bg-gradient-to-br from-white to-stone-50/60 dark:from-[#111218] dark:to-[#171821] border-stone-200/90 dark:border-stone-800 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Big Score Gauge */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-stone-50/80 dark:bg-stone-900/50 border border-stone-200/80 dark:border-stone-800 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {dict.results.finalScore}
            </span>
            <div className="my-2 flex items-baseline gap-1">
              <span
                className={clsx(
                  "text-5xl sm:text-6xl font-black numeric-ltr",
                  isPassed
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-[#b58c1c] dark:text-[#e8c676]"
                )}
              >
                {result.totalScore}
              </span>
              <span className="text-stone-400 font-bold text-lg">
                {dict.results.outOf100}
              </span>
            </div>
            <span
              className={clsx(
                "text-xs font-bold px-3 py-1 rounded-full",
                isPassed
                  ? "bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-[#e8c676]/15 text-[#8f6b15] dark:text-[#f0dfa8] border border-[#e8c676]/30"
              )}
            >
              {isPassed ? "PASSED (>= 70%)" : "NEEDS PRACTICE (< 70%)"}
            </span>
          </div>

          {/* Key Metrics Grid */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-semibold">{dict.results.correctAnswers}</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {result.correctCount}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60">
              <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 mb-1">
                <XCircle className="h-4 w-4" />
                <span className="text-xs font-semibold">{dict.results.wrongAnswers}</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {result.wrongCount}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60">
              <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                <HelpCircle className="h-4 w-4" />
                <span className="text-xs font-semibold">{dict.results.unanswered}</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                {result.unansweredCount}
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60">
              <div className="flex items-center gap-1.5 text-[#b58c1c] dark:text-[#e8c676] mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-semibold">{dict.results.timeUsed}</span>
              </div>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 numeric-ltr">
                {timeUsedMinutes}m
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics Breakdown: Difficulty & Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Difficulty Analytics */}
        <Card padding="md" className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Target className="h-4 w-4 text-[#b58c1c] dark:text-[#e8c676]" />
            <span>{dict.results.difficultyBreakdown}</span>
          </h3>

          <div className="space-y-3">
            {(["easy", "medium", "hard"] as const).map((diff) => {
              const stat = result.difficultyAnalytics[diff];
              if (stat.totalPoints === 0) return null;
              const percent = Math.round((stat.scoredPoints / stat.totalPoints) * 100);

              const variant =
                diff === "easy"
                  ? "success"
                  : diff === "medium"
                  ? "warning"
                  : "destructive";

              return (
                <div key={diff} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="capitalize text-stone-700 dark:text-stone-300">
                      {diff}
                    </span>
                    <span className="text-stone-500 numeric-ltr">
                      {stat.scoredPoints}/{stat.totalPoints} pts ({percent}%)
                    </span>
                  </div>
                  <ProgressBar value={percent} variant={variant} />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Technical Category Analytics */}
        <Card padding="md" className="space-y-4">
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#b58c1c] dark:text-[#e8c676]" />
            <span>{dict.results.categoryBreakdown}</span>
          </h3>

          <div className="space-y-3">
            {result.categoryAnalytics.map((cat: CategoryAnalytics) => (
              <div key={cat.category} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="font-semibold text-stone-700 dark:text-stone-300 truncate max-w-[200px]">
                    {cat.category}
                  </span>
                  <span className="text-stone-500 numeric-ltr">
                    {cat.scoredPoints}/{cat.totalPoints} pts ({cat.percentage}%)
                  </span>
                </div>
                <ProgressBar
                  value={cat.percentage}
                  variant={cat.percentage >= 70 ? "success" : "warning"}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Structured Qualitative Feedback & Debrief */}
      <Card padding="lg" className="space-y-6 border-[#e8c676]/30 dark:border-[#e8c676]/25">
        <div className="flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="p-2 rounded-lg bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {dict.results.aiFeedbackTitle}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Structured evaluation debrief and simulated readiness assessment
            </p>
          </div>
        </div>

        {/* Overall Assessment */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {dict.results.overallAssessment}
          </h4>
          <p className="text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
            {result.feedback.overallPerformance}
          </p>
        </div>

        {/* Strengths & Weaknesses 2-col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{dict.results.strengths}</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              {result.feedback.strengths.map((str: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-600">&bull;</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#e8c676]/10 dark:bg-[#e8c676]/10 border border-[#e8c676]/30 dark:border-[#e8c676]/25 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8f6b15] dark:text-[#f0dfa8] flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{dict.results.weaknesses}</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              {result.feedback.weaknesses.map((wk: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#b58c1c] dark:text-[#e8c676]">&bull;</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Readiness and Study Advice */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {dict.results.interviewReadiness}
            </h4>
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              {result.feedback.interviewReadiness}
            </p>
          </div>

          <div className="space-y-1 pt-2 border-t border-stone-200 dark:border-stone-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {dict.results.studyAdvice}
            </h4>
            <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
              {result.feedback.studyAdvice.map((adv: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#b58c1c] dark:text-[#e8c676]">&bull;</span>
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Continuation & Practice Options (Phase 5 CTAs) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Link href={`/${locale}/review/${attempt.id}`}>
          <Button size="lg" variant="primary">
            <span>{dict.results.reviewAnswersBtn}</span>
            <ArrowIcon className="h-4 w-4 ms-2" />
          </Button>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/${locale}/setup`}>
            <Button variant="outline" size="md">
              <RotateCcw className="h-4 w-4 me-1.5" />
              <span>{dict.results.newExamBtn}</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
