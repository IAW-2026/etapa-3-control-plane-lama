"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  updateBuyerAction,
  updateBuyerStatusAction,
  type BuyerEditorData,
  type BuyerEditorState,
} from "./actions";

type BuyerActionsProps = {
  buyer: BuyerEditorData | null;
  returnTo: string;
};

const initialState: BuyerEditorState = {
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

export function BuyerActions({ buyer, returnTo }: BuyerActionsProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [dismissedSubmission, setDismissedSubmission] = useState(0);
  const [handledSubmission, setHandledSubmission] = useState(0);
  const [currentBuyer, setCurrentBuyer] = useState(buyer);
  const [draft, setDraft] = useState<BuyerEditorData | null>(buyer);
  const [state, formAction, pending] = useActionState(updateBuyerAction, initialState);
  const canUseActions = Boolean(currentBuyer?.clerkUserId);
  const nextActive = !(currentBuyer?.active ?? true);
  const quickLabel = currentBuyer?.active ? "Desactivar" : "Activar";

  useEffect(() => {
    if (!buyer) {
      setCurrentBuyer(null);
      setDraft(null);
      return;
    }

    setCurrentBuyer(buyer);
    setDraft(buyer);
  }, [buyer]);

  useEffect(() => {
    if (
      state.status !== "success" ||
      state.submittedAt === 0 ||
      state.submittedAt === handledSubmission
    ) {
      return;
    }

    if (state.buyer) {
      setCurrentBuyer(state.buyer);
      setDraft(state.buyer);
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

  if (!currentBuyer || !draft) {
    return <span className="text-xs font-semibold text-lama-muted">Sin datos</span>;
  }

  function setDraftField<K extends keyof BuyerEditorData>(key: K, value: BuyerEditorData[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => {
          setDismissedSubmission(state.submittedAt);
          setDraft(currentBuyer);
          setEditOpen(true);
        }}
        className="rounded-[14px] border border-lama-border bg-white px-3 py-1.5 text-xs font-bold text-lama-text transition hover:border-lama-primary hover:bg-lama-primary/10"
      >
        Editar
      </button>
      <ConfirmDialog
        label={quickLabel}
        title={`${quickLabel} comprador`}
        description={
          currentBuyer.active
            ? `${currentBuyer.name} no podra realizar compras ni operar como comprador.`
            : `${currentBuyer.name} recuperara el acceso normal como comprador.`
        }
        confirmLabel={quickLabel}
        action={updateBuyerStatusAction}
        fields={{
          clerk_user_id_comprador: currentBuyer.clerkUserId,
          activo: nextActive,
          return_to: returnTo,
        }}
        variant={currentBuyer.active ? "danger" : "default"}
      />
      {editOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-lama-text/30 px-4 py-6">
          <div className="w-full max-w-[720px] rounded-[24px] border border-lama-border bg-lama-surface p-6 shadow-panel sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-lama-text">Editar comprador</h2>
                <p className="mt-2 text-sm font-medium text-lama-muted">{currentBuyer.name}</p>
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
              <input
                type="hidden"
                name="clerk_user_id_comprador"
                value={currentBuyer.clerkUserId}
              />
              <input type="hidden" name="activo" value={String(draft.active)} />
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field
                  label="Nombre comprador"
                  name="nombre_comprador"
                  value={draft.name}
                  onChange={(value) => setDraftField("name", value)}
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
                <Field
                  label="Direccion"
                  name="direccion_envio"
                  value={draft.address}
                  onChange={(value) => setDraftField("address", value)}
                />
              </div>
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
