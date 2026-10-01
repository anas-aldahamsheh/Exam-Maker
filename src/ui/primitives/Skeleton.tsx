import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "animate-pulse rounded-xl bg-stone-200/80 dark:bg-stone-800/80",
          className
        )
      )}
      {...props}
    />
  );
}
