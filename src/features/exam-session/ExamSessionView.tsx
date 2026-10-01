"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ExamAttempt, UserAnswer } from "@/types/exam";
import { useI18n } from "@/ui/providers/I18nProvider";
import { useExamTimer } from "@/features/timer/useExamTimer";
import { QuestionRenderer } from "@/features/question-renderer/QuestionRenderer";
import { QuestionNavigator } from "@/features/question-navigation/QuestionNavigator";
import { SubmissionConfirmDialog } from "@/features/submission/SubmissionConfirmDialog";
import { Button } from "@/ui/primitives/Button";
import { Card } from "@/ui/primitives/Card";
import { Badge } from "@/ui/primitives/Badge";
import { ProgressBar } from "@/ui/primitives/ProgressBar";
import {
  saveActiveAttempt,
  getActiveAttempt,
} from "@/persistence/repositories/examRepository";
import {
  Clock,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Send,
  LayoutGrid,
  CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";

interface ExamSessionViewProps {
  initialAttempt: ExamAttempt;
}

export function ExamSessionView({ initialAttempt }: ExamSessionViewProps) {
  const { locale, dict, isRTL } = useI18n();
  const router = useRouter();

  const [attempt, setAttempt] = useState<ExamAttempt>(initialAttempt);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>(
    initialAttempt.answers || {}
  );
  const [reviewFlags, setReviewFlags] = useState<string[]>(
    initialAttempt.reviewFlags || []
  );

  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileNavigator, setShowMobileNavigator] = useState(false);

  // Time warnings state
  const [activeWarning, setActiveWarning] = useState<"5min" | "1min" | null>(null);
  const [autoExpiredNotice, setAutoExpiredNotice] = useState(false);

  const PrevIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const currentQuestion = attempt.questions[currentIndex];
  const totalQuestions = attempt.questions.length;

  // Load latest state from IndexedDB on mount to recover from page refreshes
  useEffect(() => {
    async function recoverState() {
      const stored = await getActiveAttempt(initialAttempt.id);
      if (stored) {
        setAttempt(stored);
        setAnswers(stored.answers || {});
        setReviewFlags(stored.reviewFlags || []);
      }
    }
    recoverState();
  }, [initialAttempt.id]);

  // Debounced autosave to IndexedDB
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerAutosave = useCallback(
    (newAnswers: Record<string, UserAnswer>, newFlags: string[]) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = setTimeout(async () => {
        const updatedAttempt: ExamAttempt = {
          ...attempt,
          answers: newAnswers,
          reviewFlags: newFlags,
        };
        await saveActiveAttempt(updatedAttempt);
      }, 500);
    },
    [attempt]
  );

  // Submission handler (idempotent)
  const isSubmittedRef = useRef(false);

  const executeSubmission = useCallback(
    async (reason: "manual" | "expired") => {
      if (isSubmittedRef.current) return;
      isSubmittedRef.current = true;
      setIsSubmitting(true);

      const finalAttempt: ExamAttempt = {
        ...attempt,
        state: "SUBMITTED",
        submittedAt: new Date().toISOString(),
        submissionReason: reason,
        answers,
        reviewFlags,
      };

      await saveActiveAttempt(finalAttempt);

      // Navigate to grading page
      router.push(`/${locale}/grading/${attempt.id}`);
    },
    [answers, attempt, locale, reviewFlags, router]
  );

  // Handle Timer Expiry
  const handleTimerExpiry = useCallback(() => {
    setAutoExpiredNotice(true);
    executeSubmission("expired");
  }, [executeSubmission]);

  // Handle Timer Warnings
  const handleTimerWarning = useCallback((type: "5min" | "1min") => {
    setActiveWarning(type);
    setTimeout(() => {
      setActiveWarning(null);
    }, 8000); // dismiss after 8s
  }, []);

  const timer = useExamTimer({
    endAtIso: attempt.endAt,
    durationMinutes: attempt.setup.durationMinutes,
    onExpire: handleTimerExpiry,
    onWarning: handleTimerWarning,
    isPaused: isSubmitting,
  });

  // Answer modification
  const handleAnswerChange = (update: {
    selectedOptionId?: string;
    writtenResponse?: string;
  }) => {
    if (isSubmitting || timer.isExpired) return;

    const existing = answers[currentQuestion.id] || {
      questionId: currentQuestion.id,
      type: currentQuestion.type,
      lastUpdated: new Date().toISOString(),
    };

    const newAnswers = {
      ...answers,
      [currentQuestion.id]: {
        ...existing,
        ...update,
        lastUpdated: new Date().toISOString(),
      },
    };

    setAnswers(newAnswers);
    triggerAutosave(newAnswers, reviewFlags);
  };

  // Review toggle
  const handleToggleReview = () => {
    if (isSubmitting || timer.isExpired) return;

    let newFlags: string[];
    if (reviewFlags.includes(currentQuestion.id)) {
      newFlags = reviewFlags.filter((id) => id !== currentQuestion.id);
    } else {
      newFlags = [...reviewFlags, currentQuestion.id];
    }
    setReviewFlags(newFlags);
    triggerAutosave(answers, newFlags);
  };

  // Answer count calculation
  const answeredCount = attempt.questions.filter((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (a.selectedOptionId) return true;
    if (a.writtenResponse && a.writtenResponse.trim().length > 0) return true;
    return false;
  }).length;

  return (
    <div className="w-full space-y-6">
      {/* Sticky Assessment Top Bar */}
      <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-white/95 dark:bg-[#0a0b10]/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Exam Title & Seniority */}
          <div className="min-w-0 flex-1 text-start">
            <h1 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate">
              {attempt.setup.jobTitle}
            </h1>
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="capitalize">{attempt.setup.experienceLevel}</span>
              <span>&bull;</span>
              <span>
                {answeredCount}/{totalQuestions} {dict.exam.statusAnswered}
              </span>
            </div>
          </div>

          {/* Right Controls: Timer + Mobile Grid Trigger + Submit Button */}
          <div className="flex items-center gap-3">
            {/* Authoritative Timer */}
            <div
              className={clsx(
                "flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm sm:text-base transition-colors duration-200",
                timer.isCritical
                  ? "bg-red-500/10 dark:bg-red-950/60 border-red-500/40 dark:border-red-800 text-red-600 dark:text-red-400 animate-pulse-subtle"
                  : timer.isWarning
                  ? "bg-[#e8c676]/15 dark:bg-[#e8c676]/10 border-[#e8c676]/50 dark:border-[#e8c676]/40 text-[#8f6b15] dark:text-[#f0dfa8]"
                  : "bg-stone-100/90 dark:bg-stone-900/90 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100"
              )}
            >
              <Clock className="h-4 w-4 shrink-0" />
              <span className="numeric-ltr">{timer.formatted}</span>
            </div>

            {/* Mobile Navigator Sheet Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMobileNavigator(!showMobileNavigator)}
              className="md:hidden"
              aria-label="Open navigator"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>

            {/* Submit Exam Button */}
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsSubmitDialogOpen(true)}
              disabled={isSubmitting || timer.isExpired}
              className="font-semibold bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{dict.exam.submitExam}</span>
            </Button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="max-w-7xl mx-auto mt-2">
          <ProgressBar
            value={answeredCount}
            max={totalQuestions}
            variant="primary"
          />
        </div>
      </div>

      {/* Warning Banners */}
      {activeWarning === "5min" && (
        <div className="p-3.5 rounded-xl bg-[#e8c676]/15 dark:bg-[#e8c676]/10 border border-[#e8c676]/35 dark:border-[#e8c676]/30 text-[#8f6b15] dark:text-[#f0dfa8] text-sm flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[#b58c1c] dark:text-[#e8c676] shrink-0" />
            <div>
              <span className="font-bold">{dict.exam.warning5MinTitle} </span>
              <span>{dict.exam.warning5MinMsg}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveWarning(null)}
            className="text-xs font-semibold underline text-[#8f6b15] dark:text-[#f0dfa8] hover:opacity-80 transition-opacity cursor-pointer"
          >
            {dict.common.close}
          </button>
        </div>
      )}

      {activeWarning === "1min" && (
        <div className="p-3.5 rounded-xl bg-red-500/10 dark:bg-red-950/50 border border-red-500/30 dark:border-red-800 text-red-800 dark:text-red-200 text-sm flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
            <div>
              <span className="font-bold">{dict.exam.warning1MinTitle} </span>
              <span>{dict.exam.warning1MinMsg}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveWarning(null)}
            className="text-xs font-semibold underline text-red-700 dark:text-red-300 hover:opacity-80 transition-opacity cursor-pointer"
          >
            {dict.common.close}
          </button>
        </div>
      )}

      {autoExpiredNotice && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/60 border border-red-400 text-red-900 dark:text-red-100 text-sm font-semibold flex items-center gap-3">
          <Clock className="h-5 w-5 shrink-0" />
          <span>{dict.exam.timeExpiredTitle}: {dict.exam.timeExpiredMsg}</span>
        </div>
      )}

      {/* Main Examination Layout: Question Area + Desktop Navigator */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Main Question Panel (3 cols on desktop) */}
        <div className="md:col-span-3 space-y-6">
          <Card padding="lg" className="min-h-[420px] flex flex-col justify-between">
            <QuestionRenderer
              question={currentQuestion}
              questionIndex={currentIndex}
              totalQuestions={totalQuestions}
              answer={answers[currentQuestion.id]}
              isMarkedForReview={reviewFlags.includes(currentQuestion.id)}
              onAnswerChange={handleAnswerChange}
              onToggleReview={handleToggleReview}
              isLocked={isSubmitting || timer.isExpired}
            />

            {/* Bottom Question Navigation Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-stone-200/80 dark:border-stone-800 mt-6">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
              >
                <PrevIcon className="h-4 w-4" />
                <span>{dict.exam.previous}</span>
              </Button>

              <span className="text-xs text-stone-400 font-medium">
                {currentIndex + 1} / {totalQuestions}
              </span>

              {currentIndex < totalQuestions - 1 ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(totalQuestions - 1, prev + 1)
                    )
                  }
                >
                  <span>{dict.exam.next}</span>
                  <NextIcon className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => setIsSubmitDialogOpen(true)}
                  disabled={isSubmitting || timer.isExpired}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <span>{dict.exam.submitExam}</span>
                  <Send className="h-4 w-4 ms-1.5" />
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Desktop Question Navigator Sidebar (1 col on desktop) */}
        <div className="hidden md:block md:col-span-1">
          <Card padding="md" className="sticky top-40">
            <QuestionNavigator
              questions={attempt.questions}
              currentIndex={currentIndex}
              answers={answers}
              reviewFlags={reviewFlags}
              onSelectIndex={(idx) => setCurrentIndex(idx)}
            />
          </Card>
        </div>
      </div>

      {/* Mobile Navigator Drawer / Modal */}
      {showMobileNavigator && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex items-end animate-in fade-in duration-150">
          <div className="w-full bg-white dark:bg-[#111218] border-t border-stone-200 dark:border-stone-800 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Question Navigator
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMobileNavigator(false)}
              >
                {dict.common.close}
              </Button>
            </div>
            <QuestionNavigator
              questions={attempt.questions}
              currentIndex={currentIndex}
              answers={answers}
              reviewFlags={reviewFlags}
              onSelectIndex={(idx) => {
                setCurrentIndex(idx);
                setShowMobileNavigator(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Submission Confirmation Modal */}
      <SubmissionConfirmDialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        onConfirm={() => {
          setIsSubmitDialogOpen(false);
          executeSubmission("manual");
        }}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
        markedCount={reviewFlags.length}
        timeRemainingFormatted={timer.formatted}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
