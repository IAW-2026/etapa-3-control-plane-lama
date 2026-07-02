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
  const allOrders = await listOrders({
    q: "",
    page: 1,
    pageSize: 1000,
  });

  if (!allOrders.data) {
    return {
      data: null,
      error: allOrders.error,
      warning: allOrders.warning,
      meta: allOrders.meta,
    };
  }

  const orderItems = allOrders.data.items;
  const shipmentResults = await Promise.all(
    orderItems.map((order) => getShipmentByOrderId(order.id)),
  );

  // Shipping App no devuelve fecha de actualizacion; se usa la de la orden asociada.
  const allItems = shipmentResults.flatMap((result, index) =>
    result.data
      ? [{ ...result.data, updatedAt: result.data.updatedAt ?? orderItems[index].updatedAt ?? null }]
      : [],
  );
  const firstError = shipmentResults.find(
    (result) => result.error && result.error.status !== 404,
  )?.error;

  const totalItems = allItems.length;
  const { page, pageSize } = query;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const items = allItems.slice((page - 1) * pageSize, page * pageSize);

  return {
    data: { items, page, pageSize, totalItems, totalPages },
    error: firstError,
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
