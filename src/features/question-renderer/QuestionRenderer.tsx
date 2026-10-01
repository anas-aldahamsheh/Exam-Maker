"use client";

import React from "react";
import { PublicQuestion, UserAnswer } from "@/types/exam";
import { useI18n } from "@/ui/providers/I18nProvider";
import { Badge } from "@/ui/primitives/Badge";
import { Button } from "@/ui/primitives/Button";
import { Textarea } from "@/ui/primitives/Textarea";
import { Flag, CheckCircle2, Circle } from "lucide-react";
import { clsx } from "clsx";

interface QuestionRendererProps {
  question: PublicQuestion;
  questionIndex: number;
  totalQuestions: number;
  answer?: UserAnswer;
  isMarkedForReview: boolean;
  onAnswerChange: (answer: { selectedOptionId?: string; writtenResponse?: string }) => void;
  onToggleReview: () => void;
  isLocked?: boolean;
}

export function QuestionRenderer({
  question,
  questionIndex,
  totalQuestions,
  answer,
  isMarkedForReview,
  onAnswerChange,
  onToggleReview,
  isLocked = false,
}: QuestionRendererProps) {
  const { dict, isRTL } = useI18n();

  const difficultyVariant =
    question.difficulty === "hard"
      ? "destructive"
      : question.difficulty === "medium"
      ? "warning"
      : "success";

  const writtenText = answer?.writtenResponse || "";

  return (
    <div className="w-full space-y-6 text-start">
      {/* Question Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 dark:border-stone-800 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-stone-900 dark:text-stone-100">
            {dict.exam.questionLabel} {questionIndex + 1} {dict.exam.of} {totalQuestions}
          </span>
          <Badge variant={difficultyVariant} size="sm" className="capitalize">
            {question.difficulty}
          </Badge>
          <Badge variant="primary" size="sm">
            {question.category}
          </Badge>
          <Badge variant="neutral" size="sm" className="font-semibold">
            {question.points} {dict.common.pts}
          </Badge>
        </div>

        {/* Mark for Review Toggle Button */}
        <Button
          type="button"
          variant={isMarkedForReview ? "secondary" : "outline"}
          size="sm"
          onClick={onToggleReview}
          disabled={isLocked}
          className={clsx(
            "transition-colors",
            isMarkedForReview &&
              "border-[#e8c676] bg-[#e8c676]/10 text-stone-900 dark:text-[#f0dfa8] dark:border-[#e8c676]/60"
          )}
        >
          <Flag
            className={clsx(
              "h-3.5 w-3.5",
              isMarkedForReview && "fill-[#e8c676] text-[#e8c676]"
            )}
          />
          <span>
            {isMarkedForReview ? dict.exam.markedForReview : dict.exam.markForReview}
          </span>
        </Button>
      </div>

      {/* Question Prompt Text */}
      <div className="prose dark:prose-invert max-w-none text-base sm:text-lg font-medium text-stone-800 dark:text-stone-100 leading-relaxed dir-auto">
        {question.text}
      </div>

      {/* MCQ Question Renderer */}
      {question.type === "mcq" && question.options && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {dict.exam.selectOption}
          </p>
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option) => {
              const isSelected = answer?.selectedOptionId === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isLocked}
                  onClick={() => onAnswerChange({ selectedOptionId: option.id })}
                  className={clsx(
                    "w-full flex items-start gap-3.5 p-4 rounded-xl border text-start transition-all duration-150 ease-out cursor-pointer select-none active:scale-[0.99]",
                    isSelected
                      ? "border-[#e8c676] bg-[#e8c676]/10 dark:border-[#e8c676]/80 text-stone-900 dark:text-stone-100 ring-2 ring-[#e8c676]/25 shadow-xs"
                      : "border-stone-200 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50/60 dark:hover:bg-stone-900/60 bg-white/70 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300",
                    isLocked && "opacity-75 cursor-not-allowed"
                  )}
                >
                  <div className="pt-0.5 shrink-0">
                    {isSelected ? (
                      <CheckCircle2 className="h-5 w-5 text-[#b58c1c] dark:text-[#e8c676] transition-transform duration-150 scale-105" />
                    ) : (
                      <Circle className="h-5 w-5 text-stone-400 dark:text-stone-600 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <span className="inline-block font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 me-2">
                      {option.id}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed">
                      {option.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Written Technical Response Renderer */}
      {question.type === "written" && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor={`written-response-${question.id}`}
              className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400"
            >
              Your Written Technical Solution:
            </label>
            <span className="text-xs text-stone-400 dark:text-stone-500 numeric-ltr">
              {writtenText.length} {dict.exam.characterCount}
            </span>
          </div>

          <Textarea
            id={`written-response-${question.id}`}
            value={writtenText}
            onChange={(e) => onAnswerChange({ writtenResponse: e.target.value })}
            placeholder={dict.exam.writtenPlaceholder}
            disabled={isLocked}
            className="min-h-[220px] font-sans text-sm sm:text-base leading-relaxed"
          />

          <p className="text-xs text-stone-400 dark:text-stone-500">
            &bull; Include key design trade-offs, fault isolation, and architecture considerations where applicable.
          </p>
        </div>
      )}
    </div>
  );
}
