"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCompletedAttempt } from "@/persistence/repositories/examRepository";
import { CompletedAttemptRecord } from "@/persistence/indexeddb/database";
import { ReviewView } from "@/features/review/ReviewView";
import { Skeleton } from "@/ui/primitives/Skeleton";
import { Card } from "@/ui/primitives/Card";
import { Button } from "@/ui/primitives/Button";
import { useI18n } from "@/ui/providers/I18nProvider";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useI18n();

  const attemptId = params.attemptId as string;

  const [record, setRecord] = useState<CompletedAttemptRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttempt() {
      if (!attemptId) {
        setLoading(false);
        return;
      }

      const completed = await getCompletedAttempt(attemptId);
      if (completed) {
        setRecord(completed);
      }
      setLoading(false);
    }

    loadAttempt();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Card padding="lg" className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    );
  }

  if (!record) {
    return (
      <Card padding="lg" className="max-w-lg mx-auto my-12 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676] flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
          Review Record Not Found
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          We could not locate this completed examination in your browser storage.
        </p>
        <div className="pt-2">
          <Button onClick={() => router.push(`/${locale}/history`)}>
            <RotateCcw className="h-4 w-4 me-2" />
            <span>Go to Exam History</span>
          </Button>
        </div>
      </Card>
    );
  }

  return <ReviewView attempt={record.attempt} result={record.result} />;
}
