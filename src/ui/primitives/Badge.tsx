import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "neutral" | "primary" | "success" | "warning" | "destructive" | "outline" | "gradient";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    neutral:
      "bg-stone-100/90 text-stone-700 dark:bg-stone-800/90 dark:text-stone-300 border-stone-200/80 dark:border-white/5",
    primary:
      "bg-[#e8c676]/15 text-[#8f6b15] dark:text-[#f0dfa8] border-[#e8c676]/35 shadow-xs",
    success:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 dark:border-emerald-500/30",
    warning:
      "bg-[#e8c676]/15 text-[#8f6b15] dark:text-[#f0dfa8] border-[#e8c676]/35",
    destructive:
      "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20 dark:border-red-500/30",
    outline:
      "bg-transparent text-stone-700 dark:text-stone-300 border-stone-200/90 dark:border-stone-800",
    gradient:
      "bg-gradient-to-r from-[#e8c676]/20 to-[#daa945]/20 text-[#8f6b15] dark:text-[#f0dfa8] border-[#e8c676]/40 shadow-xs",
  };


  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-semibold rounded-full gap-1",
    md: "px-3 py-1 text-xs font-semibold rounded-full gap-1.5",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center border select-none backdrop-blur-xs transition-colors",
          variantStyles[variant],
          sizeStyles[size],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
