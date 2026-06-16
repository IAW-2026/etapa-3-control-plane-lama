"use client";

import type { SellerEditorData } from "./actions";

export const sellerUpdatedEvent = "lama:seller-updated";

function storageKey(clerkUserId: string) {
  return `lama:control-plane:seller:${clerkUserId}`;
}

export function readCachedSeller(clerkUserId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(storageKey(clerkUserId));
    return raw ? (JSON.parse(raw) as SellerEditorData) : null;
  } catch {
    return null;
  }
}

export function writeCachedSeller(seller: SellerEditorData) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(storageKey(seller.clerkUserId), JSON.stringify(seller));
    window.dispatchEvent(new CustomEvent<SellerEditorData>(sellerUpdatedEvent, { detail: seller }));
  } catch {
    // La cache cliente es solo una mejora visual; si falla, el guardado ya fue exitoso.
  }
}
