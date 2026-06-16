import "server-only";
import { type ListQuery } from "@/lib/pagination";
import { unsupportedResult } from "@/lib/services/api-client";
import { getOrderById, listOrders } from "@/lib/services/seller-service";
import type {
  ActionResult,
  Dispute,
  Paginated,
  Payment,
  ServiceResult,
} from "@/types/domain";

const service = "payments" as const;

function mapPaymentStatus(status: string) {
  if (status === "aprobado") {
    return "approved";
  }

  if (status === "rechazado") {
    return "rejected";
  }

  return "pending";
}

export async function listPayments(query: ListQuery): Promise<ServiceResult<Paginated<Payment>>> {
  const orders = await listOrders({
    q: "",
    page: query.page,
    pageSize: query.pageSize,
  });

  if (!orders.data) {
    return {
      data: null,
      error: orders.error,
      warning: orders.warning,
      meta: orders.meta,
    };
  }

  return {
    data: {
      items: orders.data.items.map((order) => ({
        id: order.id,
        orderId: order.id,
        provider: "Payments App",
        status: mapPaymentStatus(order.paymentStatus),
        amount: order.total,
        currency: order.currency,
        createdAt: order.createdAt,
        source: "seller-order-status",
      })),
      page: orders.data.page,
      pageSize: orders.data.pageSize,
      totalItems: orders.data.totalItems,
      totalPages: orders.data.totalPages,
    },
    warning:
      "Payments App no expone un listado administrativo de pagos; esta vista usa el estado de pago reportado por Seller App.",
    meta: {
      service,
      source: "derived",
      endpoint: "/api/ordenes-ventas",
    },
  };
}

export async function getPaymentByOrderId(orderId: string): Promise<ServiceResult<Payment>> {
  const order = await getOrderById(orderId);

  return {
    data: order.data
      ? {
          id: order.data.id,
          orderId: order.data.id,
          provider: "Payments App",
          status: mapPaymentStatus(order.data.paymentStatus),
          amount: order.data.total,
          currency: order.data.currency,
          createdAt: order.data.createdAt,
          source: "seller-order-status",
        }
      : null,
    error: order.error,
    warning:
      "Payments App no expone detalle de pago por orden; se usa el estado de pago reportado por Seller App.",
    meta: {
      service,
      source: "derived",
      endpoint: "/api/ordenes-ventas/{orden_id}",
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
