"use client";

import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type UserFeedbackPopupProps = {
  status?: string;
  message?: string;
};

export function UserFeedbackPopup({ status, message }: UserFeedbackPopupProps) {
  const [visible, setVisible] = useState(Boolean(message));
  const isError = status === "error";
  const Icon = isError ? CircleAlert : CheckCircle2;

  useEffect(() => {
    setVisible(Boolean(message));

    if (!message) {
      return;
    }

    const timeout = window.setTimeout(() => setVisible(false), isError ? 7000 : 4200);
    return () => window.clearTimeout(timeout);
  }, [isError, message]);

  if (!message || !visible) {
    return null;
  }

  return (
    <div className="fixed right-5 top-5 z-[70] w-[min(420px,calc(100vw-2.5rem))]">
      <div
        className={cn(
          "flex items-start gap-4 rounded-[22px] border bg-lama-surface p-5 text-sm font-semibold leading-6 shadow-panel",
          isError ? "border-red-200 text-red-900" : "border-emerald-200 text-lama-text",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700",
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-lama-text">
            {isError ? "No se pudo actualizar" : "Actualizado correctamente"}
          </p>
          <p className={cn("mt-1 break-words", isError ? "text-red-900" : "text-lama-muted")}>
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="rounded-[12px] border border-lama-border bg-white p-2 text-lama-muted transition hover:border-lama-primary hover:text-lama-text"
          aria-label="Cerrar mensaje"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
