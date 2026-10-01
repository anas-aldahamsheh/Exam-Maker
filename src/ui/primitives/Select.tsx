"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

export interface SelectProps<T extends string = string> {
  label?: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  name?: string;
}

export function Select<T extends string = string>({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  error,
  className,
  name,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = useId();

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && options[highlightedIndex]) {
        onChange(options[highlightedIndex].value);
        setIsOpen(false);
      } else {
        setIsOpen((prev) => !prev);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.length - 1);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    } else if (e.key === "Escape" || e.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div className={twMerge("relative w-full text-start", className)} ref={containerRef}>
      {name && <input type="hidden" name={name} value={value} />}
      {label && (
        <label
          id={`${id}-label`}
          htmlFor={`${id}-button`}
          className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1.5"
        >
          {label}
        </label>
      )}

      <button
        id={`${id}-button`}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? `${id}-label ${id}-button` : `${id}-button`}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={twMerge(
          clsx(
            "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#e8c676]",
            isOpen
              ? "border-[#e8c676] ring-2 ring-[#e8c676]/20"
              : error
              ? "border-red-500 dark:border-red-500"
              : "border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600",
            "bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100",
            disabled && "opacity-50 cursor-not-allowed bg-stone-50 dark:bg-stone-800"
          )
        )}
      >
        <span className={clsx("truncate", !selectedOption && "text-stone-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={clsx(
            "h-4 w-4 ms-2 text-stone-400 transition-transform duration-200 shrink-0",
            isOpen && "rotate-180 text-[#e8c676]"
          )}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-labelledby={`${id}-label`}
          className="absolute z-50 mt-1.5 w-full max-h-60 overflow-auto rounded-xl border border-stone-200/90 dark:border-stone-800 bg-white/95 dark:bg-[#111218]/95 backdrop-blur-md py-1.5 shadow-xl focus:outline-none animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={clsx(
                  "cursor-pointer px-3.5 py-2 text-sm flex items-center justify-between transition-colors",
                  isSelected
                    ? "bg-[#e8c676]/10 text-stone-900 dark:text-[#f0dfa8] font-medium"
                    : isHighlighted
                    ? "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-100"
                    : "text-stone-700 dark:text-stone-300"
                )}
              >
                <div>
                  <div>{option.label}</div>
                  {option.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-[#b58c1c] dark:text-[#e8c676] ms-2 shrink-0" />
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
