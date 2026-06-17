"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  updateSellerStatusAction,
  updateSellerVendorAction,
  type SellerEditorData,
  type SellerEditorState,
} from "./actions";

type SellerActionsProps = {
  seller: SellerEditorData | null;
  returnTo: string;
};

const initialState: SellerEditorState = {
  status: "idle",
  message: "",
  submittedAt: 0,
};

function buildFeedbackHref(
  returnTo: string,
  status: "success" | "error",
  message: string,
) {
  const url = new URL(returnTo, window.location.origin);

  url.searchParams.delete("sellerStatus");
  url.searchParams.delete("sellerStatusMessage");
  url.searchParams.set("sellerStatus", status);
  url.searchParams.set("sellerStatusMessage", message);

  return `${url.pathname}${url.search}`;
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0 text-sm font-bold text-lama-text">
      <span className="block truncate">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block h-12 w-full min-w-0 rounded-[14px] border border-lama-border bg-white px-4 text-sm font-semibold text-lama-text outline-none transition placeholder:text-lama-muted/70 focus:border-lama-primary focus:ring-4 focus:ring-lama-primary/15"
      />
    </label>
  );
}

export function SellerActions({ seller, returnTo }: SellerActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [dismissedSubmission, setDismissedSubmission] = useState(0);
  const [handledSubmission, setHandledSubmission] = useState(0);
  const [currentSeller, setCurrentSeller] = useState(seller);
  const [draft, setDraft] = useState<SellerEditorData | null>(seller);
  const [state, formAction, pending] = useActionState(updateSellerVendorAction, initialState);
  const canUseActions = Boolean(currentSeller?.clerkUserId);
  const nextActive = !(currentSeller?.active ?? true);
  const quickLabel = currentSeller?.active ? "Desactivar" : "Activar";

  useEffect(() => {
    if (!seller) {
      setCurrentSeller(null);
      setDraft(null);
      return;
    }

    setCurrentSeller(seller);
    setDraft(seller);
  }, [seller]);

  useEffect(() => {
    if (
      state.status !== "success" ||
      state.submittedAt === 0 ||
      state.submittedAt === handledSubmission
    ) {
      return;
    }

    if (state.seller) {
      setCurrentSeller(state.seller);
      setDraft(state.seller);
    }

    setHandledSubmission(state.submittedAt);
    setEditOpen(false);
    router.replace(buildFeedbackHref(returnTo, "success", state.message), {
      scroll: false,
    });
    router.refresh();
  }, [handledSubmission, returnTo, router, state]);

  if (!canUseActions) {
    return <span className="text-xs font-semibold text-lama-muted">Sin ID interno</span>;
  }

  if (!currentSeller || !draft) {
    return <span className="text-xs font-semibold text-lama-muted">Sin datos</span>;
  }

  function setDraftField<K extends keyof SellerEditorData>(key: K, value: SellerEditorData[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setDismissedSubmission(state.submittedAt);
          setDraft(currentSeller);
          setEditOpen(true);
        }}
        className="rounded-[14px] border border-lama-border bg-white px-4 py-2 text-xs font-bold text-lama-text transition hover:border-lama-primary hover:bg-lama-primary/10"
      >
        Editar
      </button>
      <ConfirmDialog
        label={quickLabel}
        title={`${quickLabel} vendedor`}
        description={
          currentSeller.active
            ? `${currentSeller.name} no podra gestionar sus productos ni ventas.`
            : `${currentSeller.name} recuperara el acceso normal a la plataforma.`
        }
        confirmLabel={quickLabel}
        action={updateSellerStatusAction}
        fields={{
          clerk_user_id: currentSeller.clerkUserId,
          activo: nextActive,
          return_to: returnTo,
        }}
        variant={currentSeller.active ? "danger" : "default"}
      />
      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-lama-text/30 px-4 py-6">
          <div className="w-full max-w-[720px] rounded-[24px] border border-lama-border bg-lama-surface p-6 shadow-panel sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-lama-text">Editar vendedor</h2>
                <p className="mt-2 text-sm font-medium text-lama-muted">{currentSeller.name}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDismissedSubmission(state.submittedAt);
                  setEditOpen(false);
                }}
                className="rounded-[14px] border border-lama-border bg-white px-4 py-2 text-xs font-bold text-lama-text transition hover:border-lama-primary"
              >
                Cerrar
              </button>
            </div>
            <form action={formAction} className="mt-6 space-y-5">
              <input type="hidden" name="clerk_user_id" value={currentSeller.clerkUserId} />
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field
                  label="Nombre vendedor"
                  name="nombre_vendedor"
                  value={draft.name}
                  onChange={(value) => setDraftField("name", value)}
                />
                <Field
                  label="DNI"
                  name="dni"
                  value={draft.dni}
                  onChange={(value) => setDraftField("dni", value)}
                />
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  value={draft.email}
                  onChange={(value) => setDraftField("email", value)}
                />
                <Field
                  label="Telefono"
                  name="telefono"
                  value={draft.phone}
                  onChange={(value) => setDraftField("phone", value)}
                />
              </div>
              <label className="flex items-center justify-between gap-4 rounded-[18px] border border-lama-border bg-white px-5 py-4 text-sm font-bold text-lama-text">
                <span>Vendedor activo</span>
                <span className="relative inline-flex items-center">
                  <input type="hidden" name="activo" value={String(draft.active)} />
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(event) => setDraftField("active", event.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-7 w-12 rounded-full bg-lama-border transition peer-checked:bg-lama-primary" />
                  <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-soft transition peer-checked:translate-x-5" />
                </span>
              </label>
              {state.status === "error" && state.submittedAt !== dismissedSubmission ? (
                <div className="rounded-[18px] border border-red-200 bg-red-50/80 p-4 text-sm font-semibold leading-6 text-red-900">
                  {state.message}
                </div>
              ) : null}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDismissedSubmission(state.submittedAt);
                    setEditOpen(false);
                  }}
                  className="rounded-[14px] border border-lama-border bg-white px-5 py-3 text-sm font-bold text-lama-text transition hover:border-lama-primary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-[14px] bg-lama-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-lama-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
