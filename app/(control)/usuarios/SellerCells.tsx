"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import type { SellerEditorData } from "./actions";
import { readCachedSeller, sellerUpdatedEvent } from "./seller-client-state";

type SellerCellProps = {
  seller: SellerEditorData;
};

function useSellerClientState(initialSeller: SellerEditorData) {
  const [seller, setSeller] = useState(initialSeller);

  useEffect(() => {
    const cached = readCachedSeller(initialSeller.clerkUserId);

    if (cached) {
      setSeller(cached);
    } else {
      setSeller(initialSeller);
    }

    function onSellerUpdated(event: Event) {
      const updated = (event as CustomEvent<SellerEditorData>).detail;

      if (updated.clerkUserId === initialSeller.clerkUserId) {
        setSeller(updated);
      }
    }

    window.addEventListener(sellerUpdatedEvent, onSellerUpdated);
    return () => window.removeEventListener(sellerUpdatedEvent, onSellerUpdated);
  }, [initialSeller]);

  return seller;
}

export function SellerIdentityCell({ seller: initialSeller }: SellerCellProps) {
  const seller = useSellerClientState(initialSeller);

  return (
    <div>
      <p className="font-medium">{seller.name}</p>
      <p className="mt-1 text-xs text-lama-muted">{seller.email || "-"}</p>
    </div>
  );
}

export function SellerStatusCell({ seller: initialSeller }: SellerCellProps) {
  const seller = useSellerClientState(initialSeller);

  return <StatusBadge status={seller.active ? "active" : "inactive"} />;
}
