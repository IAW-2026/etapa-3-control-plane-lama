import "server-only";
import { type ListQuery } from "@/lib/pagination";
import { requestJson, unsupportedResult } from "@/lib/services/api-client";
import type {
  ActionResult,
  Dispute,
  Paginated,
  Payment,
  ServiceResult,
} from "@/types/domain";

const service = "payments" as const;
const endpoint = "/api/pagos";

type RawPayment = {
  pago_id: string;
  orden_id: string;
  comprador_id?: string | null;
  comprador_nombre?: string | null;
  vendedor_id?: string | null;
  monto_producto?: number | null;
  monto_envio?: number | null;
  comision?: number | null;
  monto_neto?: number | null;
  monto_total: number;
  moneda?: string | null;
  estado: string;
  proveedor?: string | null;
  fecha_creacion?: string | null;
  liquidado?: boolean;
};

function mapPaymentStatus(status: string) {
  const normalized = status.trim().toLowerCase();

  if (["aprobado", "approved", "pagado", "paid"].includes(normalized)) {
    return "approved";
  }

  if (["rechazado", "rejected", "fallido", "failed"].includes(normalized)) {
    return "rejected";
  }

  if (["reembolsado", "refunded"].includes(normalized)) return "refunded";

  return "pending";
}

function mapPayment(raw: RawPayment): Payment {
  return {
    id: raw.pago_id,
    orderId: raw.orden_id,
    buyerId: raw.comprador_id ?? null,
    buyerName: raw.comprador_nombre ?? null,
    sellerId: raw.vendedor_id ?? null,
    provider: raw.proveedor ?? "Payments App",
    status: mapPaymentStatus(raw.estado),
    amount: raw.monto_total,
    productAmount: raw.monto_producto ?? null,
    shippingAmount: raw.monto_envio ?? null,
    commission: raw.comision ?? null,
    netAmount: raw.monto_neto ?? null,
    currency: raw.moneda ?? "ARS",
    createdAt: raw.fecha_creacion ?? null,
    settled: raw.liquidado === true,
    source: "payments-api",
  };
}

function matchesSearch(payment: Payment, search: string) {
  if (!search) return true;
  const value = search.toLowerCase();
  return [
    payment.id,
    payment.orderId,
    payment.buyerId,
    payment.buyerName,
    payment.sellerId,
    payment.provider,
    payment.status,
  ].some((field) => field?.toLowerCase().includes(value));
}

export async function listPayments(query: ListQuery): Promise<ServiceResult<Paginated<Payment>>> {
  const response = await requestJson<RawPayment[]>({
    service,
    path: endpoint,
    query: { rol: "super_admin" },
    headers: { "x-service-name": "admin" },
  });

  if (!response.data) {
    return {
      data: null,
      error: response.error,
      warning: response.warning,
      meta: response.meta,
    };
  }

  const filtered = response.data.map(mapPayment).filter((payment) => matchesSearch(payment, query.q));
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize));
  const page = Math.min(query.page, totalPages);
  const start = (page - 1) * query.pageSize;

  return {
    data: {
      items: filtered.slice(start, start + query.pageSize),
      page,
      pageSize: query.pageSize,
      totalItems,
      totalPages,
    },
    meta: {
      service,
      source: "live",
      endpoint,
    },
  };
}

export async function getPaymentByOrderId(orderId: string): Promise<ServiceResult<Payment>> {
  const payments = await listPayments({ q: orderId, page: 1, pageSize: 100 });
  const payment = payments.data?.items.find((item) => item.orderId === orderId) ?? null;

  return {
    data: payment,
    error: payments.error,
    warning: payments.warning,
    meta: {
      service,
      source: "live",
      endpoint,
    },
  };
}

export async function listDisputes(query: ListQuery): Promise<ServiceResult<Paginated<Dispute>>> {
  void query;

  return unsupportedResult(
    service,
    "Payments App no expone un endpoint de disputas en el contrato actual.",
    "/api/pagos",
  );
}

export async function updateDisputeStatus(
  id: string,
  status: "under_review" | "resolved" | "rejected",
): Promise<ActionResult> {
  void id;
  void status;

  return {
    success: false,
    error: {
      code: "ENDPOINT_NOT_AVAILABLE",
      message: "Payments App no expone acciones administrativas sobre disputas en el contrato actual.",
    },
  };
}
