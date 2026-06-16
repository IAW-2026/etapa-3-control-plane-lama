import "server-only";
import { type ListQuery } from "@/lib/pagination";
import { requestJson, toPaginated } from "@/lib/services/api-client";
import type { BuyerUser, OrderCheckout, Paginated, ServiceResult } from "@/types/domain";

const service = "buyer" as const;

type RawBuyer = {
  comprador_id?: string;
  compradorId?: string;
  buyer_id?: string;
  id?: string;
  nombre?: string;
  nombre_comprador?: string;
  name?: string;
  email?: string;
  correo?: string;
  estado?: string;
  status?: string;
  fecha_creacion?: string;
  createdAt?: string;
  ordenes_count?: number;
  ordersCount?: number;
  total_ordenes?: number;
};

type RawBuyersResponse =
  | RawBuyer[]
  | {
      items?: RawBuyer[];
      data?: RawBuyer[];
      results?: RawBuyer[];
      total?: number;
      totalItems?: number;
      totalPages?: number;
      page?: number;
      pageSize?: number;
      limit?: number;
    };

function mapBuyer(raw: RawBuyer): BuyerUser {
  const id = raw.comprador_id ?? raw.compradorId ?? raw.buyer_id ?? raw.id ?? raw.email ?? "-";
  const email = raw.email ?? raw.correo ?? "";
  const name = raw.nombre ?? raw.nombre_comprador ?? raw.name ?? email;

  return {
    id,
    name: name || id,
    email,
    status: raw.estado ?? raw.status ?? "active",
    createdAt: raw.fecha_creacion ?? raw.createdAt ?? null,
    ordersCount: raw.ordenes_count ?? raw.ordersCount ?? raw.total_ordenes ?? 0,
  };
}

export async function listBuyers(
  query: ListQuery,
): Promise<ServiceResult<Paginated<BuyerUser>>> {
  const response = await requestJson<RawBuyersResponse>({
    service,
    path: "/api/compradores",
    query: {
      search: query.q || undefined,
      page: query.page,
      pageSize: query.pageSize,
    },
  });

  if (!response.data) {
    return {
      ...response,
      data: null,
    };
  }

  const paginated = toPaginated<RawBuyer>(response.data, {
    items: [],
    page: query.page,
    pageSize: query.pageSize,
    totalItems: 0,
    totalPages: 1,
  });

  return {
    ...response,
    data: {
      ...paginated,
      items: paginated.items.map(mapBuyer),
    },
  };
}

type RawCheckoutResponse = {
  orden_id: string;
  comprador: {
    comprador_id: string;
    nombre: string;
    email: string;
  };
  vendedor_id: string;
  monto_producto: number;
  monto_envio: number;
  monto_total: number;
};

export async function getCheckoutByOrderId(orderId: string): Promise<ServiceResult<OrderCheckout>> {
  const response = await requestJson<RawCheckoutResponse>({
    service,
    path: `/api/ordenes/${orderId}/checkout`,
  });

  return {
    ...response,
    data: response.data
      ? {
          orderId: response.data.orden_id,
          buyer: {
            id: response.data.comprador.comprador_id,
            name: response.data.comprador.nombre,
            email: response.data.comprador.email,
          },
          sellerId: response.data.vendedor_id,
          productAmount: response.data.monto_producto,
          shippingAmount: response.data.monto_envio,
          totalAmount: response.data.monto_total,
        }
      : null,
  };
}
