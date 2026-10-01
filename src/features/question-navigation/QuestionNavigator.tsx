"use client";

import React from "react";
import { PublicQuestion, UserAnswer } from "@/types/exam";
import { useI18n } from "@/ui/providers/I18nProvider";
import { Flag, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";

interface QuestionNavigatorProps {
  questions: PublicQuestion[];
  currentIndex: number;
  answers: Record<string, UserAnswer>;
  reviewFlags: string[];
  onSelectIndex: (index: number) => void;
  className?: string;
}

export function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  reviewFlags,
  onSelectIndex,
  className,
}: QuestionNavigatorProps) {
  const { dict } = useI18n();

  const isAnswered = (qId: string) => {
    const a = answers[qId];
    if (!a) return false;
    if (a.selectedOptionId) return true;
    if (a.writtenResponse && a.writtenResponse.trim().length > 0) return true;
    return false;
  };

  const answeredCount = questions.filter((q) => isAnswered(q.id)).length;
  const markedCount = reviewFlags.length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className={clsx("space-y-4 text-start", className)}>
      {/* Mini summary badges */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-b border-stone-100 dark:border-stone-800 pb-3">
        <span className="font-semibold text-stone-700 dark:text-stone-200">
          Navigator ({questions.length})
        </span>
        <div className="flex items-center gap-2">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {answeredCount} {dict.exam.statusAnswered}
          </span>
          {markedCount > 0 && (
            <span className="text-[#b58c1c] dark:text-[#e8c676] font-medium">
              &bull; {markedCount} {dict.exam.statusReview}
            </span>
          )}
        </div>
      </div>

      {/* Questions grid */}
      <div className="grid grid-cols-5 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const active = idx === currentIndex;
          const answered = isAnswered(q.id);
          const marked = reviewFlags.includes(q.id);

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelectIndex(idx)}
              className={clsx(
                "relative h-10 w-full rounded-xl border text-xs font-semibold flex items-center justify-center transition-all duration-150 ease-out cursor-pointer active:scale-[0.96]",
                active
                  ? "ring-2 ring-[#e8c676] border-[#e8c676] shadow-xs z-10 font-bold scale-[1.02]"
                  : "hover:border-stone-400 dark:hover:border-stone-600 hover:scale-[1.03]",
                marked
                  ? "bg-[#e8c676]/15 border-[#e8c676]/80 text-[#8f6b15] dark:text-[#f0dfa8]"
                  : answered
                  ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold"
                  : "bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300"
              )}
              title={`${dict.exam.questionLabel} ${idx + 1}: ${
                marked
                  ? dict.exam.statusReview
                  : answered
                  ? dict.exam.statusAnswered
                  : dict.exam.statusUnanswered
              }`}
            >
              <span>{idx + 1}</span>

              {/* Status indicators */}
              {marked && (
                <span className="absolute -top-1 -end-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#e8c676] text-stone-950 shadow-xs">
                  <Flag className="h-2 w-2 fill-current" />
                </span>
              )}

              {!marked && answered && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex flex-wrap items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span>{dict.exam.statusAnswered}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-[#e8c676]" />
          <span>{dict.exam.statusReview}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900" />
          <span>{dict.exam.statusUnanswered}</span>
        </div>
      </div>
    </div>
  );
}
