import "server-only";
import { type ListQuery } from "@/lib/pagination";
import { requestJson, toPaginated, unsupportedResult } from "@/lib/services/api-client";
import type {
  ActionResult,
  Order,
  Paginated,
  Product,
  Seller,
  ServiceResult,
} from "@/types/domain";

const service = "seller" as const;
const authAs = "control-plane" as const;

type RawSeller = {
  vendedor_id?: string;
  clerk_user_id?: string | null;
  nombre_vendedor: string;
  dni?: string | null;
  email?: string | null;
  telefono?: string | null;
  activo?: boolean;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;
};

type RawSellerUpdate = {
  clerk_user_id: string;
  nombre_vendedor: string;
  dni: string;
  email: string;
  telefono: string;
  activo: boolean;
};

export type SellerVendorUpdatePayload = Partial<{
  nombre_vendedor: string;
  dni: string;
  email: string;
  telefono: string;
  activo: boolean;
}>;

export type SellerVendorActionResult = ActionResult & {
  data?: Seller;
};

type RawSellersResponse = {
  items: RawSeller[];
  total: number;
  page: number;
  pageSize: number;
};

type RawProduct = {
  producto_id: string;
  vendedor_id: string;
  categoria_id: string;
  imagenes?: string[];
  titulo: string;
  descripcion: string;
  precio: number;
  estado_prenda: string;
  talle: string;
  marca: string;
  genero: string;
  estado_publicacion: string;
  fecha_creacion: string;
};

type RawProductsResponse = {
  items: RawProduct[];
  total: number;
  page: number;
  pageSize: number;
  vendedores?: RawSeller[];
};

type RawOrderListItem = {
  orden_id: string;
  comprador_id: string;
  items: Array<{
    producto_id: string;
    precio_unitario: number;
  }>;
  producto_ids?: string[];
  total: number;
  direccion_envio: string;
  estado_general: string;
  estado_pago: string;
  estado_envio: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
};

type RawOrdersResponse = {
  items: RawOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
};

type RawOrderDetail = {
  orden_id: string;
  comprador_id: string;
  vendedor_id: string;
  items: Array<{
    producto_id: string;
    precio_unitario: number;
    titulo: string;
    imagenes?: string[];
  }>;
  producto_ids?: string[];
  total: number;
  direccion_envio: string;
  estado_general: string;
  estado_pago: string;
  estado_envio: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
};

function mapSeller(raw: RawSeller): Seller {
  const active = raw.activo !== false;
  const id = raw.vendedor_id ?? raw.clerk_user_id ?? "-";

  return {
    id,
    clerkUserId: raw.clerk_user_id ?? id,
    storeName: raw.nombre_vendedor,
    dni: raw.dni ?? null,
    ownerName: raw.nombre_vendedor,
    email: raw.email ?? null,
    phone: raw.telefono ?? null,
    active,
    status: active ? "active" : "inactive",
    productsCount: null,
    createdAt: raw.fecha_creacion ?? raw.fecha_actualizacion ?? null,
  };
}

function mapOrder(raw: RawOrderListItem | RawOrderDetail): Order {
  return {
    id: raw.orden_id,
    buyerId: raw.comprador_id,
    buyerName: raw.comprador_id,
    sellerId: "vendedor_id" in raw ? raw.vendedor_id : null,
    sellerName: null,
    status: raw.estado_general,
    paymentStatus: raw.estado_pago,
    shippingStatus: raw.estado_envio,
    total: raw.total,
    currency: "ARS",
    createdAt: raw.fecha_creacion,
    updatedAt: raw.fecha_actualizacion,
    shippingAddress: raw.direccion_envio,
    itemCount: raw.items.length,
  };
}

export async function listSellers(query: ListQuery): Promise<ServiceResult<Paginated<Seller>>> {
  const response = await requestJson<RawSellersResponse>({
    service,
    path: "/api/vendedores",
    authAs,
    query: {
      search: query.q || undefined,
      page: query.page,
      pageSize: query.pageSize,
    },
  });

  return {
    ...response,
    data: response.data
      ? toPaginated<Seller>(
          {
            items: response.data.items.map(mapSeller),
            total: response.data.total,
            page: response.data.page,
            pageSize: response.data.pageSize,
          },
          {
            items: [],
            page: query.page,
            pageSize: query.pageSize,
            totalItems: 0,
            totalPages: 1,
          },
        )
      : null,
  };
}

export async function getSellerById(id: string): Promise<ServiceResult<Seller>> {
  void id;

  return unsupportedResult(
    service,
    "Seller App no expone detalle individual de vendedor en el contrato actual.",
    "/api/vendedores",
  );
}

export async function updateSellerVendor(
  clerkUserId: string,
  payload: SellerVendorUpdatePayload,
): Promise<SellerVendorActionResult> {
  const response = await requestJson<RawSellerUpdate>({
    service,
    path: `/api/vendedores/${encodeURIComponent(clerkUserId)}`,
    method: "PATCH",
    authAs,
    body: payload,
  });

  return response.error
    ? { success: false, error: response.error }
    : { success: true, data: response.data ? mapSeller(response.data) : undefined };
}

export async function updateSellerVendorStatus(
  clerkUserId: string,
  active: boolean,
): Promise<SellerVendorActionResult> {
  const response = await requestJson<RawSellerUpdate>({
    service,
    path: `/api/vendedores/${encodeURIComponent(clerkUserId)}/estado`,
    method: "PATCH",
    authAs,
    body: {
      activo: active,
    },
  });

  return response.error
    ? { success: false, error: response.error }
    : { success: true, data: response.data ? mapSeller(response.data) : undefined };
}

export async function setSellerEnabled(
  id: string,
  clerkUserId: string,
  enabled: boolean,
): Promise<ActionResult> {
  void id;

  return updateSellerVendorStatus(clerkUserId, enabled);
}

export async function listProducts(query: ListQuery): Promise<ServiceResult<Paginated<Product>>> {
  const response = await requestJson<RawProductsResponse>({
    service,
    path: "/api/productos",
    authAs,
    query: {
      search: query.q || undefined,
      sort: "recent",
      page: query.page,
      pageSize: query.pageSize,
    },
  });

  const sellersById = new Map(
    (response.data?.vendedores ?? []).map((seller) => [
      seller.vendedor_id ?? seller.clerk_user_id ?? "",
      seller.nombre_vendedor,
    ]),
  );

  return {
    ...response,
    data: response.data
      ? toPaginated<Product>(
          {
            items: response.data.items.map((product) => ({
              id: product.producto_id,
              sellerId: product.vendedor_id,
              sellerName: sellersById.get(product.vendedor_id) ?? null,
              categoryId: product.categoria_id,
              title: product.titulo,
              description: product.descripcion,
              imageUrl: product.imagenes?.[0] ?? null,
              brand: product.marca,
              size: product.talle,
              gender: product.genero,
              condition: product.estado_prenda,
              status: product.estado_publicacion,
              price: product.precio,
              stock: null,
              createdAt: product.fecha_creacion,
            })),
            total: response.data.total,
            page: response.data.page,
            pageSize: response.data.pageSize,
          },
          {
            items: [],
            page: query.page,
            pageSize: query.pageSize,
            totalItems: 0,
            totalPages: 1,
          },
        )
      : null,
  };
}

export async function listOrders(query: ListQuery): Promise<ServiceResult<Paginated<Order>>> {
  const response = await requestJson<RawOrdersResponse>({
    service,
    path: "/api/ordenes-ventas",
    authAs,
    query: {
      page: query.page,
      pageSize: query.pageSize,
    },
  });

  return {
    ...response,
    warning: query.q
      ? "La busqueda textual de ordenes no esta soportada por Seller App y fue ignorada."
      : response.warning,
    data: response.data
      ? toPaginated<Order>(
          {
            items: response.data.items.map(mapOrder),
            total: response.data.total,
            page: response.data.page,
            pageSize: response.data.pageSize,
          },
          {
            items: [],
            page: query.page,
            pageSize: query.pageSize,
            totalItems: 0,
            totalPages: 1,
          },
        )
      : null,
  };
}

export async function getOrderById(id: string): Promise<ServiceResult<Order>> {
  const response = await requestJson<RawOrderDetail>({
    service,
    path: `/api/ordenes-ventas/${id}`,
    authAs,
  });

  return {
    ...response,
    data: response.data ? mapOrder(response.data) : null,
  };
}
