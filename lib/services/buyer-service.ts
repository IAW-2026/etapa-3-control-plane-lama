import "server-only";
import { requestJson, unsupportedResult } from "@/lib/services/api-client";
import type { BuyerUser, OrderCheckout, Paginated, ServiceResult } from "@/types/domain";

const service = "buyer" as const;

export async function listBuyers(): Promise<ServiceResult<Paginated<BuyerUser>>> {
  return unsupportedResult(
    service,
    "Buyer App no expone un listado global de compradores en el contrato actual.",
    "/api/ordenes/{orden_id}/checkout",
  );
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
