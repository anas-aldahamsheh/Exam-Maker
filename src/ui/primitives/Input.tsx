import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, disabled, icon, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full text-start">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute start-3.5 flex items-center pointer-events-none text-stone-400 dark:text-stone-500">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={twMerge(
              clsx(
                "w-full py-2.5 rounded-xl border text-sm font-normal transition-all duration-150 ease-out outline-none",
                icon ? "ps-10 pe-4" : "px-4",
                "bg-white/80 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500",
                error
                  ? "border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "border-stone-200 dark:border-stone-800 focus:border-[#e8c676] focus:ring-2 focus:ring-[#e8c676]/20 focus:bg-white dark:focus:bg-stone-900/90 hover:border-stone-300 dark:hover:border-stone-700",
                disabled && "opacity-50 cursor-not-allowed bg-stone-50 dark:bg-stone-800",
                className
              )
            )}
            {...props}
          />
        </div>

        {error ? (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-stone-500 dark:text-stone-400">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
