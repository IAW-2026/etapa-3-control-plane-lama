import "server-only";
import { normalizeBaseUrl } from "@/lib/utils";

function firstDefined(...values: Array<string | undefined>) {
  return values.find((value) => Boolean(value?.trim()))?.trim();
}

export const serviceUrlEnvNames = {
  buyer: ["BUYER_API_URL", "BUYER_APP_URL"],
  seller: ["SELLER_API_URL", "SELLER_APP_URL"],
  shipping: ["SHIPPING_API_URL", "SHIPPING_APP_URL"],
  payments: ["PAYMENTS_API_URL", "PAYMENTS_APP_URL"],
} as const;

export const serviceApiKeyEnvNames = {
  buyer: "BUYER_API_KEY",
  seller: "SELLER_API_KEY",
  shipping: "SHIPPING_API_KEY",
  payments: "PAYMENTS_API_KEY",
} as const;

export const appConfig = {
  clerkSuperAdminRole: process.env.CLERK_SUPER_ADMIN_ROLE || "super_admin",
  controlPlaneApiKey: firstDefined(process.env.INTERNAL_API_KEY, process.env.CONTROL_PLANE_API_KEY),
  requestTimeoutMs: Number(process.env.API_REQUEST_TIMEOUT_MS || 8000),
  services: {
    buyer: normalizeBaseUrl(firstDefined(process.env.BUYER_API_URL, process.env.BUYER_APP_URL)),
    seller: normalizeBaseUrl(firstDefined(process.env.SELLER_API_URL, process.env.SELLER_APP_URL)),
    shipping: normalizeBaseUrl(
      firstDefined(process.env.SHIPPING_API_URL, process.env.SHIPPING_APP_URL),
    ),
    payments: normalizeBaseUrl(
      firstDefined(process.env.PAYMENTS_API_URL, process.env.PAYMENTS_APP_URL),
    ),
  },
  apiKeys: {
    buyer: firstDefined(process.env.BUYER_API_KEY),
    seller: firstDefined(process.env.SELLER_API_KEY),
    shipping: firstDefined(process.env.SHIPPING_API_KEY),
    payments: firstDefined(process.env.PAYMENTS_API_KEY),
  },
};

export type ServiceName = keyof typeof appConfig.services;
