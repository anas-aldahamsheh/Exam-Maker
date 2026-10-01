"use client";

import React from "react";
import { Dialog } from "@/ui/primitives/Dialog";
import { Button } from "@/ui/primitives/Button";
import { useI18n } from "@/ui/providers/I18nProvider";
import { AlertTriangle, Clock, CheckCircle2, Flag } from "lucide-react";

interface SubmissionConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  answeredCount: number;
  totalQuestions: number;
  markedCount: number;
  timeRemainingFormatted: string;
  isSubmitting?: boolean;
}

export function SubmissionConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  answeredCount,
  totalQuestions,
  markedCount,
  timeRemainingFormatted,
  isSubmitting = false,
}: SubmissionConfirmDialogProps) {
  const { dict } = useI18n();

  const unansweredCount = totalQuestions - answeredCount;
  const hasUnanswered = unansweredCount > 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isSubmitting ? () => {} : onClose}
      title={dict.exam.confirmSubmitTitle}
    >
      <div className="space-y-4 text-start">
        <p className="text-sm text-stone-600 dark:text-stone-300">
          {dict.exam.confirmSubmitMsg}
        </p>

        {/* Warning banner if there are unanswered questions */}
        {hasUnanswered && (
          <div className="p-3.5 rounded-xl bg-[#e8c676]/15 dark:bg-[#e8c676]/10 border border-[#e8c676]/35 dark:border-[#e8c676]/30 text-[#8f6b15] dark:text-[#f0dfa8] text-xs flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#b58c1c] dark:text-[#e8c676] mt-0.5" />
            <div>
              <p className="font-semibold">{dict.exam.unansweredWarningTitle}</p>
              <p className="mt-0.5">
                {unansweredCount} {dict.exam.unansweredWarningMsg}
              </p>
            </div>
          </div>
        )}

        {/* Statistics breakdown summary */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50/80 dark:bg-stone-900/60 rounded-xl text-center border border-stone-200/90 dark:border-stone-800">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Answered</span>
            </div>
            <p className="text-base font-bold text-stone-900 dark:text-stone-100">
              {answeredCount}/{totalQuestions}
            </p>
          </div>

          <div className="space-y-1 border-x border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-center gap-1 text-[#b58c1c] dark:text-[#e8c676]">
              <Flag className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">Flagged</span>
            </div>
            <p className="text-base font-bold text-stone-900 dark:text-stone-100">
              {markedCount}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1 text-stone-700 dark:text-stone-300">
              <Clock className="h-3.5 w-3.5 text-[#b58c1c] dark:text-[#e8c676]" />
              <span className="text-xs font-semibold">Remaining</span>
            </div>
            <p className="text-base font-bold text-stone-900 dark:text-stone-100 numeric-ltr">
              {timeRemainingFormatted}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {dict.exam.continueExamBtn}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="md"
            onClick={onConfirm}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {dict.exam.confirmSubmitBtn}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
