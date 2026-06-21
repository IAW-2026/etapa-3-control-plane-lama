import "server-only";
import { type ListQuery } from "@/lib/pagination";
import { requestJson } from "@/lib/services/api-client";
import { listOrders } from "@/lib/services/seller-service";
import type { Paginated, ServiceResult, Shipment } from "@/types/domain";

const service = "shipping" as const;

type RawShipment = {
  envio_id: string;
  orden_id: string;
  codigo_seguimiento: string;
  empresa_logistica: string;
  estado: string;
};

export async function listShipments(query: ListQuery): Promise<ServiceResult<Paginated<Shipment>>> {
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

  const shipmentResults = await Promise.all(
    orders.data.items.map((order) => getShipmentByOrderId(order.id)),
  );

  const items = shipmentResults.flatMap((result) => (result.data ? [result.data] : []));
  const firstError = shipmentResults.find(
    (result) => result.error && result.error.status !== 404,
  )?.error;

  return {
    data: {
      items,
      page: orders.data.page,
      pageSize: orders.data.pageSize,
      totalItems: orders.data.totalItems,
      totalPages: orders.data.totalPages,
    },
    error: firstError,
    warning:
      "Shipping App no expone un listado global de envios; esta vista se arma a partir de las ordenes de Seller App.",
    meta: {
      service,
      source: "derived",
      endpoint: "/api/envios/orden/{orden_id}",
    },
  };
}

export async function getShipmentByOrderId(orderId: string): Promise<ServiceResult<Shipment>> {
  const response = await requestJson<RawShipment>({
    service,
    path: `/api/envios/orden/${orderId}`,
    authAs: "control-plane",
  });

  return {
    ...response,
    data: response.data
      ? {
          id: response.data.envio_id,
          orderId: response.data.orden_id,
          trackingCode: response.data.codigo_seguimiento,
          carrier: response.data.empresa_logistica,
          status: response.data.estado,
          updatedAt: null,
        }
      : null,
  };
}
