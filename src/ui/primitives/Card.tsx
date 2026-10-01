import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export function Card({
  className,
  padding = "md",
  interactive = false,
  children,
  ...props
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "glass-card rounded-2xl transition-all duration-200 ease-out",
          paddingStyles[padding],
          interactive &&
            "cursor-pointer hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-md active:scale-[0.995]",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
