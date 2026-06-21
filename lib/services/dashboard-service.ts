import "server-only";
import { listBuyers } from "@/lib/services/buyer-service";
import { listPayments } from "@/lib/services/payments-service";
import { listOrders, listProducts, listSellers } from "@/lib/services/seller-service";
import { listShipments } from "@/lib/services/shipping-service";
import type { DashboardStats, ServiceError } from "@/types/domain";

const firstPage = {
  q: "",
  page: 1,
  pageSize: 1,
};

export async function getDashboardStats(): Promise<{
  stats: DashboardStats;
  errors: ServiceError[];
  warnings: string[];
}> {
  const [buyers, sellers, products, orders, shipments, payments] = await Promise.all([
    listBuyers(firstPage),
    listSellers(firstPage),
    listProducts(firstPage),
    listOrders(firstPage),
    listShipments(firstPage),
    listPayments(firstPage),
  ]);

  const results = [buyers, sellers, products, orders, shipments, payments];
  const warnings = results.flatMap((result) => (result.warning ? [result.warning] : []));

  return {
    stats: {
      buyers: buyers.data?.totalItems ?? 0,
      sellers: sellers.data?.totalItems ?? 0,
      products: products.data?.totalItems ?? 0,
      orders: orders.data?.totalItems ?? 0,
      shipments: shipments.data?.totalItems ?? 0,
      payments: payments.data?.totalItems ?? 0,
    },
    errors: results.flatMap((result) => (result.error ? [result.error] : [])),
    warnings,
  };
}
