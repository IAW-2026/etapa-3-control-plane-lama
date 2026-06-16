import "server-only";
import { listDisputes, listPayments } from "@/lib/services/payments-service";
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
  const [sellers, products, orders, shipments, payments, disputes] = await Promise.all([
    listSellers(firstPage),
    listProducts(firstPage),
    listOrders(firstPage),
    listShipments(firstPage),
    listPayments(firstPage),
    listDisputes(firstPage),
  ]);

  const results = [sellers, products, orders, shipments, payments, disputes];
  const warnings = results.flatMap((result) => (result.warning ? [result.warning] : []));
  warnings.unshift(
    "Buyer App no expone un listado global de compradores, por eso ese KPI no puede calcularse todavia.",
  );

  return {
    stats: {
      buyers: 0,
      sellers: sellers.data?.totalItems ?? 0,
      products: products.data?.totalItems ?? 0,
      orders: orders.data?.totalItems ?? 0,
      shipments: shipments.data?.totalItems ?? 0,
      payments: payments.data?.totalItems ?? 0,
      disputes: disputes.data?.totalItems ?? 0,
    },
    errors: results.flatMap((result) => (result.error ? [result.error] : [])),
    warnings,
  };
}
