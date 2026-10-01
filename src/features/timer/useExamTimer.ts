"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseExamTimerProps {
  endAtIso: string;
  durationMinutes: number;
  onExpire: () => void;
  onWarning?: (warningType: "5min" | "1min") => void;
  isPaused?: boolean;
}

export function useExamTimer({
  endAtIso,
  durationMinutes,
  onExpire,
  onWarning,
  isPaused = false,
}: UseExamTimerProps) {
  const calculateRemaining = useCallback(() => {
    const endMs = new Date(endAtIso).getTime();
    const nowMs = Date.now();
    return Math.max(0, endMs - nowMs);
  }, [endAtIso]);

  const [remainingMs, setRemainingMs] = useState<number>(calculateRemaining);
  const warned5MinRef = useRef<boolean>(false);
  const warned1MinRef = useRef<boolean>(false);
  const expiredRef = useRef<boolean>(false);

  // Sync timer tick
  useEffect(() => {
    if (isPaused || expiredRef.current) return;

    const checkTime = () => {
      const remaining = calculateRemaining();
      setRemainingMs(remaining);

      // Warning thresholds check (only trigger if initial duration was longer than threshold)
      if (durationMinutes > 5 && remaining <= 5 * 60 * 1000 && remaining > 1 * 60 * 1000) {
        if (!warned5MinRef.current) {
          warned5MinRef.current = true;
          onWarning?.("5min");
        }
      }

      if (durationMinutes > 1 && remaining <= 1 * 60 * 1000 && remaining > 0) {
        if (!warned1MinRef.current) {
          warned1MinRef.current = true;
          onWarning?.("1min");
        }
      }

      // Expiry check
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    };

    // Immediate initial check
    checkTime();

    const interval = setInterval(checkTime, 1000);

    // Re-check instantly when window regains focus or tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTime();
      }
    };

    window.addEventListener("focus", checkTime);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkTime);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [calculateRemaining, durationMinutes, isPaused, onExpire, onWarning]);

  // Format MM:SS or HH:MM:SS
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formatted =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isCritical = remainingMs <= 60 * 1000 && remainingMs > 0;
  const isWarning = remainingMs <= 5 * 60 * 1000 && !isCritical;
  const isExpired = remainingMs <= 0;

  return {
    remainingMs,
    formatted,
    isWarning,
    isCritical,
    isExpired,
  };
}
