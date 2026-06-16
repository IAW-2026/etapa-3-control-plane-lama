"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  label: string;
  title: string;
  description: string;
  confirmLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string | number | boolean>;
  variant?: "default" | "danger";
};

function SubmitButton({ children, variant }: { children: string; variant: "default" | "danger" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "rounded-[14px] px-5 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
        variant === "danger" ? "bg-red-700 hover:bg-red-800" : "bg-lama-text hover:bg-lama-text/90",
      )}
    >
      {pending ? "Procesando..." : children}
    </button>
  );
}

export function ConfirmDialog({
  label,
  title,
  description,
  confirmLabel,
  action,
  fields,
  variant = "default",
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "rounded-[14px] border px-4 py-2 text-xs font-bold transition",
          variant === "danger"
            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-lama-border bg-white text-lama-text hover:border-lama-primary",
        )}
      >
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-lama-text/30 px-4">
          <div className="w-full max-w-md rounded-[24px] border border-lama-border bg-lama-surface p-7 shadow-panel">
            <h2 className="text-xl font-black text-lama-text">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-lama-muted">{description}</p>
            <form
              action={action}
              onSubmit={() => setOpen(false)}
              className="mt-6 flex justify-end gap-3"
            >
              {Object.entries(fields).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={String(value)} />
              ))}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-[14px] border border-lama-border bg-white px-5 py-3 text-sm font-bold text-lama-text transition hover:border-lama-primary"
              >
                Cancelar
              </button>
              <SubmitButton variant={variant}>{confirmLabel}</SubmitButton>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
