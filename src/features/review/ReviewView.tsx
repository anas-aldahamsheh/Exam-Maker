"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExamAttempt, ExamResult, PublicQuestion } from "@/types/exam";
import { useI18n } from "@/ui/providers/I18nProvider";
import { Card } from "@/ui/primitives/Card";
import { Button } from "@/ui/primitives/Button";
import { Badge } from "@/ui/primitives/Badge";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Filter,
} from "lucide-react";
import { clsx } from "clsx";

interface ReviewViewProps {
  attempt: ExamAttempt;
  result: ExamResult;
}

export function ReviewView({ attempt, result }: ReviewViewProps) {
  const { locale, dict, isRTL } = useI18n();
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect">("all");

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  const filteredQuestions = attempt.questions.filter((q: PublicQuestion) => {
    const qRes = result.questionResults[q.id];
    if (filter === "correct") return qRes?.isCorrect;
    if (filter === "incorrect") return !qRes?.isCorrect;
    return true;
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-start py-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
            {dict.review.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            {dict.review.subtitle}
          </p>
        </div>

        <Link href={`/${locale}/results/${attempt.id}`}>
          <Button variant="outline" size="sm">
            <ArrowIcon className="h-4 w-4 me-1.5" />
            <span>{dict.review.backToResults}</span>
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-stone-500 flex items-center gap-1 me-2">
          <Filter className="h-3.5 w-3.5" />
          Filter:
        </span>
        <Button
          variant={filter === "all" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("all")}
          className="h-8 text-xs"
        >
          {dict.review.allFilter} ({attempt.questions.length})
        </Button>
        <Button
          variant={filter === "correct" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("correct")}
          className="h-8 text-xs text-emerald-600 dark:text-emerald-400"
        >
          {dict.review.correctFilter} ({result.correctCount})
        </Button>
        <Button
          variant={filter === "incorrect" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("incorrect")}
          className="h-8 text-xs text-red-600 dark:text-red-400"
        >
          {dict.review.incorrectFilter} ({attempt.questions.length - result.correctCount})
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.map((question: PublicQuestion) => {
          const qRes = result.questionResults[question.id];
          const isCorrect = qRes?.isCorrect ?? false;
          const pointsAwarded = qRes?.scoreAwarded ?? 0;
          const originalIndex = attempt.questions.findIndex((q: PublicQuestion) => q.id === question.id);

          return (
            <Card
              key={question.id}
              padding="lg"
              className={clsx(
                "space-y-5 border transition-all duration-200",
                isCorrect
                  ? "border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/10"
                  : "border-stone-200/80 dark:border-stone-800"
              )}
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {dict.review.question} {originalIndex + 1}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {question.category}
                  </Badge>
                  <Badge variant="outline" size="sm" className="capitalize">
                    {question.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={isCorrect ? "success" : pointsAwarded > 0 ? "warning" : "destructive"}
                    size="sm"
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-3 w-3 me-1" />
                    ) : (
                      <XCircle className="h-3 w-3 me-1" />
                    )}
                    <span>
                      {pointsAwarded} / {question.points} {dict.common.pts}
                    </span>
                  </Badge>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-base font-medium text-stone-800 dark:text-stone-200 dir-auto">
                {question.text}
              </p>

              {/* MCQ Review Breakdown */}
              {question.type === "mcq" && question.options && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 gap-2">
                    {question.options.map((opt: { id: string; text: string }) => {
                      const isUserSelected = qRes?.selectedOptionId === opt.id;
                      const isOptionCorrect = qRes?.correctOptionId === opt.id;

                      let style = "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 text-stone-700 dark:text-stone-300";
                      if (isOptionCorrect) {
                        style =
                          "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium";
                      } else if (isUserSelected && !isOptionCorrect) {
                        style =
                          "border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-950 dark:text-red-200 line-through";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={clsx(
                            "flex items-start gap-3 p-3 rounded-xl border text-sm transition-colors",
                            style
                          )}
                        >
                          <span className="font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200">
                            {opt.id}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                          {isOptionCorrect && (
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              (Correct Answer)
                            </span>
                          )}
                          {isUserSelected && !isOptionCorrect && (
                            <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                              (Your Choice)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {qRes?.explanation && (
                    <div className="p-3.5 rounded-xl bg-[#e8c676]/10 dark:bg-[#e8c676]/10 border border-[#e8c676]/30 dark:border-[#e8c676]/25 text-xs text-stone-900 dark:text-[#f0dfa8] space-y-1">
                      <p className="font-semibold flex items-center gap-1.5 text-[#8f6b15] dark:text-[#f0dfa8]">
                        <BookOpen className="h-3.5 w-3.5 text-[#b58c1c] dark:text-[#e8c676]" />
                        <span>{dict.review.explanation}</span>
                      </p>
                      <p className="leading-relaxed text-stone-700 dark:text-stone-300">{qRes.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Written Question Review Breakdown */}
              {question.type === "written" && (
                <div className="space-y-4 pt-2">
                  {/* Candidate Answer Box */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      {dict.review.yourAnswer}
                    </span>
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-sm text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                      {qRes?.writtenResponse || (
                        <span className="text-stone-400 italic">
                          {dict.review.notAnswered}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Rubric Evaluation */}
                  {qRes?.evaluation && (
                    <div className="p-4 rounded-xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-[#b58c1c] dark:text-[#e8c676]" />
                        <span>{dict.review.rubricEvaluation}</span>
                      </h4>

                      {/* Dimension Scores */}
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                          <p className="text-stone-400">Correctness</p>
                          <p className="font-bold text-stone-900 dark:text-stone-100 numeric-ltr">
                            {qRes.evaluation.dimensionScores.correctness}/10
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                          <p className="text-stone-400">Completeness</p>
                          <p className="font-bold text-stone-900 dark:text-stone-100 numeric-ltr">
                            {qRes.evaluation.dimensionScores.completeness}/10
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                          <p className="text-stone-400">Clarity</p>
                          <p className="font-bold text-stone-900 dark:text-stone-100 numeric-ltr">
                            {qRes.evaluation.dimensionScores.clarity}/10
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
                          <p className="text-stone-400">Understanding</p>
                          <p className="font-bold text-stone-900 dark:text-stone-100 numeric-ltr">
                            {qRes.evaluation.dimensionScores.technicalUnderstanding}/10
                          </p>
                        </div>
                        <div className="p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 col-span-2 sm:col-span-1">
                          <p className="text-stone-400">Relevance</p>
                          <p className="font-bold text-stone-900 dark:text-stone-100 numeric-ltr">
                            {qRes.evaluation.dimensionScores.relevance}/10
                          </p>
                        </div>
                      </div>

                      {/* Constructive feedback */}
                      <div className="space-y-2 text-xs">
                        {qRes.evaluation.whatWasCorrect.length > 0 && (
                          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300">
                              {dict.review.whatWasCorrect}
                            </span>
                            <ul className="space-y-1 text-stone-700 dark:text-stone-300">
                              {qRes.evaluation.whatWasCorrect.map((item: string, i: number) => (
                                <li key={i}>&bull; {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {qRes.evaluation.whatWasMissing.length > 0 && (
                          <div className="p-3 rounded-xl bg-[#e8c676]/10 dark:bg-[#e8c676]/10 border border-[#e8c676]/30 dark:border-[#e8c676]/25 space-y-1">
                            <span className="font-bold text-[#8f6b15] dark:text-[#f0dfa8]">
                              {dict.review.whatWasMissing}
                            </span>
                            <ul className="space-y-1 text-stone-700 dark:text-stone-300">
                              {qRes.evaluation.whatWasMissing.map((item: string, i: number) => (
                                <li key={i}>&bull; {item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Model Ideal Answer (F032) */}
                      {qRes.evaluation.suggestedBetterAnswer && (
                        <div className="p-3.5 rounded-xl bg-[#e8c676]/10 dark:bg-[#e8c676]/10 border border-[#e8c676]/30 dark:border-[#e8c676]/25 space-y-1 text-xs">
                          <span className="font-bold text-[#8f6b15] dark:text-[#f0dfa8] flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5 text-[#b58c1c] dark:text-[#e8c676]" />
                            {dict.review.suggestedBetterAnswer}
                          </span>
                          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                            {qRes.evaluation.suggestedBetterAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
