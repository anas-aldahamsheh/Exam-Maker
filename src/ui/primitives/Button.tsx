import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8c676] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#090a0e] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-gradient-to-b from-[#f5e4b3] via-[#e8c676] to-[#daa945] text-stone-950 font-semibold shadow-xs hover:brightness-[1.04] active:brightness-[0.96] border border-[#fbf3d5]/70 focus-visible:ring-[#e8c676]",
      secondary:
        "bg-stone-100/90 text-stone-800 hover:bg-stone-200/90 dark:bg-stone-900/90 dark:text-stone-200 dark:hover:bg-stone-800/90 dark:border dark:border-white/5",
      outline:
        "border border-stone-200/90 bg-white/80 hover:bg-stone-100/90 hover:border-stone-300 text-stone-800 dark:border-stone-800/90 dark:bg-stone-900/60 dark:text-stone-200 dark:hover:bg-stone-800/80 dark:hover:border-stone-700 backdrop-blur-xs",
      destructive:
        "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs hover:brightness-105 active:brightness-95 focus-visible:ring-red-500",
      ghost:
        "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/60 dark:hover:text-stone-100",
    };



    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(
          clsx(
            baseStyles,
            variantStyles[variant],
            sizeStyles[size],
            className
          )
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ms-1 me-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
