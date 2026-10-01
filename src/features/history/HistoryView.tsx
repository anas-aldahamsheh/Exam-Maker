"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompletedAttemptRecord } from "@/persistence/indexeddb/database";
import {
  getAllCompletedAttempts,
  clearAllHistory,
  saveActiveAttempt,
} from "@/persistence/repositories/examRepository";
import { useI18n } from "@/ui/providers/I18nProvider";
import { Card } from "@/ui/primitives/Card";
import { Button } from "@/ui/primitives/Button";
import { Badge } from "@/ui/primitives/Badge";
import { Input } from "@/ui/primitives/Input";
import {
  History as HistoryIcon,
  Search,
  RotateCcw,
  Trash2,
  FileText,
  GitCompare,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  PlusCircle,
} from "lucide-react";
import { clsx } from "clsx";

export function HistoryView() {
  const { locale, dict, isRTL } = useI18n();
  const router = useRouter();

  const [records, setRecords] = useState<CompletedAttemptRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const loadHistory = async () => {
    setLoading(true);
    const data = await getAllCompletedAttempts();
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearAll = async () => {
    if (window.confirm(dict.history.confirmClear)) {
      await clearAllHistory();
      setRecords([]);
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleRetryExam = async (record: CompletedAttemptRecord) => {
    // Clone attempt with new startedAt / endAt and cleared answers
    const setup = record.attempt.setup;
    const now = new Date();
    const endAt = new Date(now.getTime() + setup.durationMinutes * 60 * 1000);

    const newAttempt = {
      ...record.attempt,
      id: crypto.randomUUID(),
      state: "READY" as const,
      startedAt: now.toISOString(),
      endAt: endAt.toISOString(),
      submittedAt: undefined,
      submissionReason: undefined,
      answers: {},
      reviewFlags: [],
      createdAt: now.toISOString(),
      result: undefined,
    };

    await saveActiveAttempt(newAttempt);
    router.push(`/${locale}/exam/${newAttempt.id}`);
  };

  const filteredRecords = records.filter((r) =>
    r.attempt.setup.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCompare = () => {
    if (selectedIds.length < 2) return;
    const query = selectedIds.slice(0, 3).join(",");
    router.push(`/${locale}/compare?attempts=${query}`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 text-start py-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 dark:border-stone-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <HistoryIcon className="h-7 w-7 text-[#b58c1c] dark:text-[#e8c676]" />
            <span>{dict.history.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {dict.history.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length >= 2 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleCompare}
            >
              <GitCompare className="h-4 w-4 me-1.5" />
              <span>{dict.history.compareBtn.replace("{count}", String(selectedIds.length))}</span>
            </Button>
          )}

          {records.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <Trash2 className="h-3.5 w-3.5 me-1" />
              <span>{dict.history.clearAll}</span>
            </Button>
          )}

          <Link href={`/${locale}/setup`}>
            <Button size="sm">
              <PlusCircle className="h-3.5 w-3.5 me-1" />
              <span>{dict.nav.newExam}</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Count Bar */}
      {records.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="w-full sm:w-72">
            <Input
              placeholder={dict.history.filterRole}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <span className="text-xs text-stone-500">
            {filteredRecords.length} attempt(s) recorded locally
          </span>
        </div>
      )}

      {/* Empty State */}
      {!loading && records.length === 0 && (
        <Card padding="lg" className="text-center py-16 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8c676]/15 text-[#b58c1c] dark:text-[#e8c676]">
            <HistoryIcon className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {dict.history.emptyTitle}
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              {dict.history.emptyDesc}
            </p>
          </div>
          <div className="pt-2">
            <Link href={`/${locale}/setup`}>
              <Button size="md">
                <PlusCircle className="h-4 w-4 me-2" />
                <span>{dict.history.startFirstExam}</span>
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Records List */}
      {filteredRecords.length > 0 && (
        <div className="space-y-3">
          {filteredRecords.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isPassed = item.result.totalScore >= 70;
            const dateStr = new Date(item.completedAt).toLocaleDateString(
              locale === "ar" ? "ar-EG" : "en-US",
              { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
            );

            return (
              <Card
                key={item.id}
                padding="md"
                className={clsx(
                  "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-150 hover:border-stone-300 dark:hover:border-stone-700",
                  isSelected && "border-[#e8c676] dark:border-[#e8c676] bg-[#e8c676]/10 ring-1 ring-[#e8c676]/20"
                )}
              >
                {/* Left check & details */}
                <div className="flex items-center gap-3.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(item.id)}
                    className="h-4 w-4 rounded border-stone-300 text-[#c59b27] focus:ring-[#e8c676] accent-[#c59b27] cursor-pointer"
                    title="Select to compare"
                  />

                  {/* Score badge */}
                  <div
                    className={clsx(
                      "flex flex-col items-center justify-center h-12 w-14 rounded-xl font-bold text-base shrink-0",
                      isPassed
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        : "bg-[#e8c676]/15 text-[#8f6b15] dark:text-[#f0dfa8] border border-[#e8c676]/30"
                    )}
                  >
                    <span className="text-sm numeric-ltr">{item.result.totalScore}</span>
                    <span className="text-[9px] font-normal text-stone-500">/100</span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                        {item.attempt.setup.jobTitle}
                      </span>
                      <Badge variant="outline" size="sm" className="capitalize text-[10px]">
                        {item.attempt.setup.experienceLevel}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
                      <span>{dateStr}</span>
                      <span>&bull;</span>
                      <span>
                        {item.result.correctCount}/{item.attempt.questions.length} correct
                      </span>
                      <span>&bull;</span>
                      <span className="numeric-ltr">{Math.round(item.result.timeUsedSeconds / 60)}m used</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link href={`/${locale}/results/${item.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      <FileText className="h-3.5 w-3.5 me-1" />
                      <span>{dict.common.view}</span>
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRetryExam(item)}
                    className="h-8 text-xs"
                    title="Retry Exam with same parameters"
                  >
                    <RotateCcw className="h-3.5 w-3.5 me-1" />
                    <span>Retry</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
