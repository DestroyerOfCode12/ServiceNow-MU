"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { clsx } from "clsx";

export type ToastVariant = "success" | "info" | "xp";

export interface ToastInput {
  message: string;
  variant?: ToastVariant;
  /** ms before auto-dismiss. Defaults to 3500. */
  durationMs?: number;
}

interface ToastEntry extends Required<ToastInput> {
  id: number;
}

interface ToastContextValue {
  show: (toast: ToastInput) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-success bg-success-bg text-success",
  info: "border-border bg-surface text-foreground",
  xp: "border-accent bg-surface text-accent",
};

/**
 * Fires small, non-blocking notifications (streak/XP updates, quick
 * confirmations) — never blocking, never a modal. Stacks bottom-center so
 * it's thumb-reachable on mobile and never collides with the sticky exam
 * header at the top of the screen. `aria-live="polite"` so screen reader
 * users hear it without an in-progress question being interrupted.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const nextId = useRef(0);

  const show = useCallback((toast: ToastInput) => {
    const id = nextId.current++;
    const entry: ToastEntry = {
      id,
      message: toast.message,
      variant: toast.variant ?? "info",
      durationMs: toast.durationMs ?? 3500,
    };
    setToasts((prev) => [...prev, entry]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, entry.durationMs);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={clsx(
              "motion-fade-in-up pointer-events-auto rounded-lg border px-4 py-2 text-sm font-medium shadow-lg",
              VARIANT_STYLES[t.variant],
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
