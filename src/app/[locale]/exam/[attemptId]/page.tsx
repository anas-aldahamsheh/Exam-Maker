"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ExamAttempt } from "@/types/exam";
import { getActiveAttempt } from "@/persistence/repositories/examRepository";
import { ExamSessionView } from "@/features/exam-session/ExamSessionView";
import { Skeleton } from "@/ui/primitives/Skeleton";
import { Card } from "@/ui/primitives/Card";
import { Button } from "@/ui/primitives/Button";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useI18n } from "@/ui/providers/I18nProvider";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const { locale, dict } = useI18n();

  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadAttempt() {
      if (!attemptId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const stored = await getActiveAttempt(attemptId);
      if (stored) {
        // If already submitted/completed, redirect to results or grading
        if (stored.state === "COMPLETED") {
          router.replace(`/${locale}/results/${stored.id}`);
          return;
        }
        if (stored.state === "SUBMITTED" || stored.state === "GRADING") {
          router.replace(`/${locale}/grading/${stored.id}`);
          return;
        }

        setAttempt(stored);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }

    loadAttempt();
  }, [attemptId, locale, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Card padding="lg" className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      </div>
    );
  }

  if (notFound || !attempt) {
    return (
      <Card padding="lg" className="max-w-lg mx-auto my-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Exam Session Not Found
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          This active exam attempt could not be found in your local browser storage, or it has expired.
        </p>
        <div className="pt-2">
          <Button onClick={() => router.push(`/${locale}/setup`)}>
            <RotateCcw className="h-4 w-4 me-2" />
            <span>Create New Exam</span>
          </Button>
        </div>
      </Card>
    );
  }

  return <ExamSessionView initialAttempt={attempt} />;
}
