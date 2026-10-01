"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useI18n } from "@/ui/providers/I18nProvider";
import {
  getActiveAttempt,
  saveCompletedAttempt,
  getCompletedAttempt,
} from "@/persistence/repositories/examRepository";
import { Card } from "@/ui/primitives/Card";
import { Button } from "@/ui/primitives/Button";
import { Badge } from "@/ui/primitives/Badge";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { clsx } from "clsx";

export default function GradingPage() {
  const params = useParams();
  const router = useRouter();
  const { locale, dict } = useI18n();

  const attemptId = params.attemptId as string;

  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const processingRef = useRef(false);

  const steps = [
    { title: dict.grading.mcqStep },
    { title: dict.grading.writtenStep },
    { title: dict.grading.feedbackStep },
  ];

  const performGrading = async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setError(null);
    setIsRetrying(true);

    try {
      // 1. Check if already completed and stored
      const existingCompleted = await getCompletedAttempt(attemptId);
      if (existingCompleted) {
        router.replace(`/${locale}/results/${attemptId}`);
        return;
      }

      // 2. Fetch active attempt
      const attempt = await getActiveAttempt(attemptId);
      if (!attempt) {
        throw new Error("Active attempt not found. Please restart or check history.");
      }

      // Advance UI visual progress
      const stepTimer1 = setTimeout(() => setStepIndex(1), 1000);
      const stepTimer2 = setTimeout(() => setStepIndex(2), 2500);

      // 3. Post to grading API
      const res = await fetch("/api/exam/grade-written", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attempt),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const data = await res.json();
      if (!res.ok || !data.success || !data.result) {
        throw new Error(data.error || "Failed to finalize exam grading");
      }

      // 4. Update attempt state to COMPLETED and persist locally
      const completedAttempt = {
        ...attempt,
        state: "COMPLETED" as const,
        result: data.result,
      };

      await saveCompletedAttempt(completedAttempt, data.result);

      // 5. Navigate to Results page
      router.replace(`/${locale}/results/${attemptId}`);
    } catch (err: unknown) {
      console.error("Grading execution error:", err);
      setError((err as Error).message || dict.common.error);
      setIsRetrying(false);
      processingRef.current = false;
    }
  };

  useEffect(() => {
    performGrading();
  }, [attemptId]);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center">
      <Card padding="lg" className="shadow-lg space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676]">
          <Sparkles className="h-8 w-8 animate-pulse-subtle" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {dict.grading.title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            {dict.grading.subtitle}
          </p>
        </div>

        {error ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-3 text-start">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Grading Encountered An Issue</p>
                <p className="mt-1 text-xs opacity-90">{error}</p>
              </div>
            </div>

            <Button
              size="lg"
              variant="primary"
              onClick={performGrading}
              disabled={isRetrying}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 me-2" />
              <span>Retry Grading</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2 text-start">
            {steps.map((step, idx) => {
              const isDone = idx < stepIndex;
              const isCurrent = idx === stepIndex;

              return (
                <div
                  key={idx}
                  className={clsx(
                    "flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-200",
                    isDone
                      ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200"
                      : isCurrent
                      ? "border-[#e8c676]/70 dark:border-[#e8c676]/60 bg-[#e8c676]/10 dark:bg-[#e8c676]/10 text-stone-900 dark:text-[#f0dfa8]"
                      : "border-stone-100 dark:border-stone-800 opacity-40 text-stone-500"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="h-5 w-5 text-[#b58c1c] dark:text-[#e8c676] animate-spin shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border border-stone-300 dark:border-stone-700 shrink-0" />
                  )}
                  <span className="text-sm font-medium">{step.title}</span>
                </div>
              );
            })}

            <p className="text-xs text-center text-stone-400 pt-2">
              {dict.grading.pleaseWait}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
