import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  variant?: "primary" | "success" | "warning" | "destructive";
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  variant = "primary",
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const barColors = {
    primary: "bg-gradient-to-r from-[#f5e4b3] via-[#e8c676] to-[#daa945] shadow-xs",
    success: "bg-emerald-600 dark:bg-emerald-500",
    warning: "bg-[#e8c676] dark:bg-[#e8c676]",
    destructive: "bg-red-600 dark:bg-red-500",
  };

  return (
    <div className={twMerge("w-full", className)} {...props}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
          {label && <span>{label}</span>}
          {showPercent && <span className="numeric-ltr">{percentage}%</span>}
        </div>
      )}
      <div
        className="w-full bg-stone-200/80 dark:bg-stone-800/80 rounded-full h-2.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-300 ease-out",
            barColors[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
