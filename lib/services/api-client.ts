import "server-only";
import {
  appConfig,
  serviceUrlEnvNames,
  type ServiceName,
} from "@/lib/config";
import type { Paginated, ServiceError, ServiceResult } from "@/types/domain";

type RequestOptions = {
  service: ServiceName;
  path: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  headers?: HeadersInit;
  authAs?: "service" | "control-plane";
};

function buildUrl(baseUrl: string, path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

function parseApiError(status: number, payload: string): ServiceError {
  if (!payload) {
    return {
      code: `HTTP_${status}`,
      message: `La API respondio con estado ${status}.`,
      status,
    };
  }

  try {
    const parsed = JSON.parse(payload) as { message?: string; error?: string; code?: string };
    return {
      code: parsed.code ?? `HTTP_${status}`,
      message: parsed.message ?? parsed.error ?? `La API respondio con estado ${status}.`,
      status,
    };
  } catch {
    return {
      code: `HTTP_${status}`,
      message: payload.slice(0, 180),
      status,
    };
  }
}

function buildAuthHeaders(service: ServiceName, authAs: "service" | "control-plane" = "service") {
  const headers: Record<string, string> = {};

  if (authAs === "control-plane") {
    if (appConfig.controlPlaneApiKey) {
      headers["x-service-name"] = "control-plane";
      headers["x-api-key"] = appConfig.controlPlaneApiKey;
    }

    return headers;
  }

  const serviceApiKey = appConfig.apiKeys[service];

  if (serviceApiKey) {
    headers["x-service-name"] = service;
    headers["x-api-key"] = serviceApiKey;
    return headers;
  }

  if (appConfig.controlPlaneApiKey) {
    headers["x-service-name"] = "control-plane";
    headers["x-api-key"] = appConfig.controlPlaneApiKey;
  }

  return headers;
}

export function unsupportedResult<T>(
  service: ServiceName,
  message: string,
  endpoint: string,
): ServiceResult<T> {
  return {
    data: null,
    error: {
      code: "ENDPOINT_NOT_AVAILABLE",
      message,
    },
    meta: {
      service,
      source: "unavailable",
      endpoint,
    },
  };
}

export async function requestJson<T>({
  service,
  path,
  method = "GET",
  query,
  body,
  headers,
  authAs = "service",
}: RequestOptions): Promise<ServiceResult<T>> {
  const baseUrl = appConfig.services[service];

  if (!baseUrl) {
    return {
      data: null,
      error: {
        code: "SERVICE_NOT_CONFIGURED",
        message: `Falta configurar la URL de ${service}. Variables aceptadas: ${serviceUrlEnvNames[service].join(" o ")}.`,
      },
      meta: {
        service,
        source: "unavailable",
        endpoint: path,
      },
    };
  }

  const url = buildUrl(baseUrl, path, query);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), appConfig.requestTimeoutMs);

  try {
    const response = await fetch(url, {
      method,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...buildAuthHeaders(service, authAs),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const payload = await response.text();

    if (!response.ok) {
      return {
        data: null,
        error: parseApiError(response.status, payload),
        meta: {
          service,
          source: "live",
          endpoint: path,
        },
      };
    }

    return {
      data: payload ? (JSON.parse(payload) as T) : (null as T),
      meta: {
        service,
        source: "live",
        endpoint: path,
      },
    };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      data: null,
      error: {
        code: aborted ? "REQUEST_TIMEOUT" : "REQUEST_FAILED",
        message: aborted
          ? `La API ${service} no respondio dentro del tiempo esperado.`
          : error instanceof Error
            ? error.message
            : "No se pudo completar la llamada a la API.",
      },
      meta: {
        service,
        source: "live",
        endpoint: path,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function toPaginated<T>(
  raw: unknown,
  fallback: Paginated<T>,
): Paginated<T> {
  if (Array.isArray(raw)) {
    return {
      items: raw as T[],
      page: fallback.page,
      pageSize: fallback.pageSize,
      totalItems: raw.length,
      totalPages: Math.max(1, Math.ceil(raw.length / fallback.pageSize)),
    };
  }

  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const candidate = raw as {
    items?: T[];
    data?: T[];
    results?: T[];
    page?: number;
    pageSize?: number;
    limit?: number;
    total?: number;
    totalItems?: number;
    totalPages?: number;
  };

  const items = candidate.items ?? candidate.data ?? candidate.results ?? fallback.items;
  const page = candidate.page ?? fallback.page;
  const pageSize = candidate.pageSize ?? candidate.limit ?? fallback.pageSize;
  const totalItems = candidate.totalItems ?? candidate.total ?? items.length;
  const totalPages = candidate.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));

  return {
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}
