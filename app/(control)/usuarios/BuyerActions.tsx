"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { updateBuyerStatusAction, type BuyerStatusData } from "./actions";

type BuyerActionsProps = {
  buyer: BuyerStatusData | null;
  returnTo: string;
};

export function BuyerActions({ buyer, returnTo }: BuyerActionsProps) {
  if (!buyer?.clerkUserId) {
    return <span className="text-xs font-semibold text-lama-muted">Sin ID interno</span>;
  }

  const nextActive = !buyer.active;
  const quickLabel = buyer.active ? "Desactivar" : "Activar";

  return (
    <ConfirmDialog
      label={quickLabel}
      title={`${quickLabel} comprador`}
      description={
        buyer.active
          ? `${buyer.name} no podra realizar compras ni operar como comprador.`
          : `${buyer.name} recuperara el acceso normal como comprador.`
      }
      confirmLabel={quickLabel}
      action={updateBuyerStatusAction}
      fields={{
        clerk_user_id_comprador: buyer.clerkUserId,
        activo: nextActive,
        return_to: returnTo,
      }}
      variant={buyer.active ? "danger" : "default"}
    />
  );
}
