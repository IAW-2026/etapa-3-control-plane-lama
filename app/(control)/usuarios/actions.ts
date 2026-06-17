"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import {
  updateBuyer,
  updateBuyerStatus,
  type BuyerUpdatePayload,
} from "@/lib/services/buyer-service";
import {
  updateSellerVendor,
  updateSellerVendorStatus,
  type SellerVendorUpdatePayload,
} from "@/lib/services/seller-service";

export type BuyerEditorData = {
  clerkUserId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
};

export type BuyerEditorState = {
  status: "idle" | "success" | "error";
  message: string;
  submittedAt: number;
  buyer?: BuyerEditorData;
};

export type SellerEditorData = {
  clerkUserId: string;
  name: string;
  dni: string;
  email: string;
  phone: string;
  active: boolean;
};

export type SellerEditorState = {
  status: "idle" | "success" | "error";
  message: string;
  submittedAt: number;
  seller?: SellerEditorData;
};

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function usersRedirect(
  returnTo: string,
  status: "success" | "error",
  message: string,
) {
  const safeReturnTo = returnTo.startsWith("/usuarios") ? returnTo : "/usuarios";
  const url = new URL(safeReturnTo, "http://control-plane.local");

  url.searchParams.delete("sellerStatus");
  url.searchParams.delete("sellerStatusMessage");
  url.searchParams.set("sellerStatus", status);
  url.searchParams.set("sellerStatusMessage", message);

  return `${url.pathname}${url.search}`;
}

function isActiveUserStatus(status: string) {
  return ![
    "inactive",
    "inactiva",
    "inactivo",
    "disabled",
    "deshabilitado",
    "deshabilitada",
    "desactivado",
    "desactivada",
  ].includes(status.toLowerCase());
}

function toBuyerEditorData(
  buyer: {
    clerkUserId?: string | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    status?: string | null;
  },
  fallbackClerkUserId: string,
  fallbackActive: boolean,
): BuyerEditorData {
  return {
    clerkUserId: buyer.clerkUserId ?? fallbackClerkUserId,
    name: buyer.name,
    email: buyer.email ?? "",
    phone: buyer.phone ?? "",
    address: buyer.address ?? "",
    active: buyer.status ? isActiveUserStatus(buyer.status) : fallbackActive,
  };
}

function toSellerEditorData(
  seller: {
    clerkUserId?: string | null;
    id: string;
    storeName: string;
    dni?: string | null;
    email?: string | null;
    phone?: string | null;
    active: boolean;
  },
  fallbackClerkUserId: string,
): SellerEditorData {
  return {
    clerkUserId: seller.clerkUserId ?? fallbackClerkUserId,
    name: seller.storeName,
    dni: seller.dni ?? "",
    email: seller.email ?? "",
    phone: seller.phone ?? "",
    active: seller.active,
  };
}

export async function updateSellerStatusAction(formData: FormData) {
  await requireSuperAdmin();

  const clerkUserId = formString(formData, "clerk_user_id");
  const returnTo = formString(formData, "return_to") || "/usuarios";
  const enabled = formString(formData, "activo") === "true";

  if (!clerkUserId) {
    redirect(
      usersRedirect(
        returnTo,
        "error",
        "No se pudo actualizar el vendedor porque faltan datos de identificacion.",
      ),
    );
  }

  const result = await updateSellerVendorStatus(clerkUserId, enabled);

  if (!result.success) {
    redirect(
      usersRedirect(
        returnTo,
        "error",
        result.error?.message ?? "No se pudo actualizar el estado del vendedor.",
      ),
    );
  }

  revalidatePath("/usuarios");
  redirect(
    usersRedirect(
      returnTo,
      "success",
      enabled ? "Vendedor activado correctamente." : "Vendedor desactivado correctamente.",
    ),
  );
}

export async function updateBuyerAction(
  _previousState: BuyerEditorState,
  formData: FormData,
): Promise<BuyerEditorState> {
  await requireSuperAdmin();

  const clerkUserId = formString(formData, "clerk_user_id_comprador");
  const buyerName = formString(formData, "nombre_comprador");
  const active = formString(formData, "activo") === "true";

  if (!clerkUserId) {
    return {
      status: "error",
      message: "No se pudo actualizar el comprador porque falta el identificador interno.",
      submittedAt: Date.now(),
    };
  }

  if (!buyerName) {
    return {
      status: "error",
      message: "El nombre del comprador es obligatorio.",
      submittedAt: Date.now(),
    };
  }

  const payload: BuyerUpdatePayload = {
    nombre_comprador: buyerName,
    email: formString(formData, "email"),
    telefono: formString(formData, "telefono"),
    direccion_envio: formString(formData, "direccion_envio"),
  };

  const result = await updateBuyer(clerkUserId, payload);

  if (!result.success) {
    return {
      status: "error",
      message: result.error?.message ?? "No se pudo guardar la edicion del comprador.",
      submittedAt: Date.now(),
    };
  }

  revalidatePath("/usuarios");

  return {
    status: "success",
    message: "Comprador actualizado correctamente.",
    submittedAt: Date.now(),
    buyer: result.data ? toBuyerEditorData(result.data, clerkUserId, active) : undefined,
  };
}

export async function updateBuyerStatusAction(formData: FormData) {
  await requireSuperAdmin();

  const clerkUserId = formString(formData, "clerk_user_id_comprador");
  const returnTo = formString(formData, "return_to") || "/usuarios";
  const enabled = formString(formData, "activo") === "true";

  if (!clerkUserId) {
    redirect(
      usersRedirect(
        returnTo,
        "error",
        "No se pudo actualizar el comprador porque faltan datos de identificacion.",
      ),
    );
  }

  const result = await updateBuyerStatus(clerkUserId, enabled);

  if (!result.success) {
    redirect(
      usersRedirect(
        returnTo,
        "error",
        result.error?.message ?? "No se pudo actualizar el estado del comprador.",
      ),
    );
  }

  revalidatePath("/usuarios");
  redirect(
    usersRedirect(
      returnTo,
      "success",
      enabled ? "Comprador activado correctamente." : "Comprador desactivado correctamente.",
    ),
  );
}

function formBoolean(formData: FormData, key: string) {
  const values = formData.getAll(key);
  const value = values[values.length - 1];
  return value === "true";
}

function addOptionalString(
  payload: SellerVendorUpdatePayload,
  key: "dni" | "email" | "telefono",
  value: string,
) {
  if (value) {
    payload[key] = value;
  }
}

export async function updateSellerVendorAction(
  _previousState: SellerEditorState,
  formData: FormData,
): Promise<SellerEditorState> {
  await requireSuperAdmin();

  const clerkUserId = formString(formData, "clerk_user_id");
  const sellerName = formString(formData, "nombre_vendedor");

  if (!clerkUserId) {
    return {
      status: "error",
      message: "No se pudo actualizar el vendedor porque falta el identificador interno.",
      submittedAt: Date.now(),
    };
  }

  if (!sellerName) {
    return {
      status: "error",
      message: "El nombre del vendedor es obligatorio.",
      submittedAt: Date.now(),
    };
  }

  const payload: SellerVendorUpdatePayload = {
    nombre_vendedor: sellerName,
    activo: formBoolean(formData, "activo"),
  };
  addOptionalString(payload, "dni", formString(formData, "dni"));
  addOptionalString(payload, "email", formString(formData, "email"));
  addOptionalString(payload, "telefono", formString(formData, "telefono"));

  const result = await updateSellerVendor(clerkUserId, payload);

  if (!result.success) {
    return {
      status: "error",
      message: result.error?.message ?? "No se pudo guardar la edicion del vendedor.",
      submittedAt: Date.now(),
    };
  }

  revalidatePath("/usuarios");

  return {
    status: "success",
    message: "Vendedor actualizado correctamente.",
    submittedAt: Date.now(),
    seller: result.data ? toSellerEditorData(result.data, clerkUserId) : undefined,
  };
}
