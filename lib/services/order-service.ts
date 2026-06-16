import "server-only";
import { getCheckoutByOrderId } from "@/lib/services/buyer-service";
import { getPaymentByOrderId } from "@/lib/services/payments-service";
import { getOrderById } from "@/lib/services/seller-service";
import { getShipmentByOrderId } from "@/lib/services/shipping-service";
import type { ConsolidatedOrder } from "@/types/domain";

export async function getConsolidatedOrder(id: string): Promise<ConsolidatedOrder> {
  const order = await getOrderById(id);

  if (!order.data) {
    return {
      order: null,
      buyer: null,
      seller: null,
      payment: null,
      shipment: null,
      errors: order.error ? [order.error] : [],
    };
  }

  const [checkout, payment, shipment] = await Promise.all([
    getCheckoutByOrderId(order.data.id),
    getPaymentByOrderId(order.data.id),
    getShipmentByOrderId(order.data.id),
  ]);

  return {
    order: order.data,
    buyer: checkout.data
      ? {
          id: checkout.data.buyer.id,
          name: checkout.data.buyer.name,
          email: checkout.data.buyer.email,
          status: null,
          createdAt: null,
          ordersCount: 0,
        }
      : null,
    seller: order.data.sellerId
      ? {
          id: order.data.sellerId,
          storeName: order.data.sellerName ?? order.data.sellerId,
          ownerName: null,
          email: null,
          status: "unknown",
          productsCount: null,
          createdAt: null,
        }
      : null,
    payment: payment.data,
    shipment: shipment.data,
    errors: [order, checkout, payment, shipment].flatMap((result) =>
      result.error ? [result.error] : [],
    ),
  };
}
