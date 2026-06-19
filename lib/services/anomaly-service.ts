import "server-only";
import { listBuyers } from "@/lib/services/buyer-service";
import { listPayments } from "@/lib/services/payments-service";
import { listOrders, listProducts, listSellers } from "@/lib/services/seller-service";
import type {
  AlertSeverity,
  OperationalAlert,
  OperationalSnapshot,
  Order,
  Product,
  Seller,
} from "@/types/domain";

const query = { q: "", page: 1, pageSize: 100 };
const paidStatuses = new Set(["approved", "paid", "aprobado", "pagado", "pagada"]);
const rejectedStatuses = new Set(["rejected", "failed", "rechazado", "fallido"]);
const pendingStatuses = new Set([
  "pending",
  "pendiente",
  "pendiente_pago",
  "en_preparacion",
  "created",
  "creada",
]);
const advancedShippingStatuses = new Set([
  "shipped",
  "in_transit",
  "delivered",
  "despachado",
  "despachada",
  "entregado",
  "entregada",
]);
const activeProductStatuses = new Set(["active", "activo", "activa", "published", "publicado"]);

function normalize(value: string) {
  return value.trim().toLowerCase().replaceAll(" ", "_");
}

function hoursSince(value: string, now: number) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? (now - timestamp) / 3_600_000 : 0;
}

function median(values: number[]) {
  const sorted = values.filter((value) => value > 0).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function alert(
  severity: AlertSeverity,
  category: OperationalAlert["category"],
  code: string,
  entityType: OperationalAlert["entityType"],
  entityId: string,
  title: string,
  description: string,
  recommendation: string,
  href: string,
): OperationalAlert {
  return {
    id: `${code}:${entityId}`,
    severity,
    category,
    title,
    description,
    recommendation,
    entityType,
    entityId,
    href,
  };
}

function analyzeOrders(orders: Order[], now: number) {
  const alerts: OperationalAlert[] = [];
  const typicalTotal = median(orders.map((order) => order.total));

  for (const order of orders) {
    const payment = normalize(order.paymentStatus);
    const shipping = normalize(order.shippingStatus);
    const status = normalize(order.status);
    const age = hoursSince(order.updatedAt ?? order.createdAt, now);
    const href = `/ordenes/${encodeURIComponent(order.id)}`;

    if (paidStatuses.has(payment) && pendingStatuses.has(shipping) && age >= 48) {
      alerts.push(alert(
        "high", "shipping", "paid-without-shipping", "order", order.id,
        "Pago aprobado sin avance de envio",
        `La orden lleva ${Math.floor(age)} horas sin avance de envio despues del pago.`,
        "Verificar preparacion, stock y coordinacion con Shipping App.", href,
      ));
    }

    if (advancedShippingStatuses.has(shipping) && !paidStatuses.has(payment)) {
      alerts.push(alert(
        rejectedStatuses.has(payment) ? "critical" : "high",
        "payment", "shipping-without-payment", "order", order.id,
        "Envio avanzado sin pago confirmado",
        `El envio figura como ${order.shippingStatus}, pero el pago figura como ${order.paymentStatus}.`,
        "Revisar la conciliacion del pago antes de continuar la entrega.", href,
      ));
    }

    if (pendingStatuses.has(status) && age >= 72) {
      alerts.push(alert(
        "medium", "order", "stale-order", "order", order.id,
        "Orden estancada",
        `La orden permanece en ${order.status} desde hace ${Math.floor(age)} horas.`,
        "Identificar el servicio que bloquea el flujo y contactar al responsable.", href,
      ));
    }

    if (orders.length >= 5 && typicalTotal > 0 && order.total >= typicalTotal * 3) {
      alerts.push(alert(
        "medium", "order", "unusual-total", "order", order.id,
        "Monto inusualmente alto",
        "El total supera tres veces la mediana de las ordenes analizadas.",
        "Validar items, precios y comprador antes de procesar la orden.", href,
      ));
    }
  }

  const chronological = [...orders].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  for (let index = 1; index < chronological.length; index += 1) {
    const previous = chronological[index - 1];
    const current = chronological[index];
    const minutesApart = (Date.parse(current.createdAt) - Date.parse(previous.createdAt)) / 60_000;
    if (
      current.buyerId === previous.buyerId &&
      current.total === previous.total &&
      minutesApart >= 0 &&
      minutesApart <= 15
    ) {
      alerts.push(alert(
        "medium", "order", "possible-duplicate", "order", current.id,
        "Posible orden duplicada",
        `Coincide en comprador y monto con la orden ${previous.id}, creada ${Math.round(minutesApart)} minutos antes.`,
        "Confirmar con el comprador antes de preparar ambos pedidos.",
        `/ordenes/${encodeURIComponent(current.id)}`,
      ));
    }
  }

  return alerts;
}

function analyzeCatalog(products: Product[], sellers: Seller[]) {
  const alerts: OperationalAlert[] = [];
  const inactiveSellerIds = new Set(
    sellers
      .filter((seller) => !seller.active)
      .flatMap((seller) => [seller.id, seller.clerkUserId].filter((id): id is string => Boolean(id))),
  );
  const typicalPrice = median(products.map((product) => product.price));

  for (const product of products) {
    const sellerIds = product.sellerIds ?? [product.sellerId];
    if (
      activeProductStatuses.has(normalize(product.status)) &&
      sellerIds.some((sellerId) => inactiveSellerIds.has(sellerId))
    ) {
      alerts.push(alert(
        "high", "seller", "inactive-seller-product", "product", product.id,
        "Producto activo de vendedor inactivo",
        "La publicacion sigue visible aunque el vendedor esta desactivado.",
        "Pausar la publicacion o reactivar al vendedor despues de verificar su estado.",
        `/productos?q=${encodeURIComponent(product.title)}`,
      ));
    }

    if (products.length >= 8 && typicalPrice > 0 && product.price >= typicalPrice * 4) {
      alerts.push(alert(
        "low", "catalog", "unusual-price", "product", product.id,
        "Precio fuera del rango habitual",
        "El precio supera cuatro veces la mediana del catalogo analizado.",
        "Revisar si el precio es intencional o un error de carga.",
        `/productos?q=${encodeURIComponent(product.title)}`,
      ));
    }
  }

  return alerts;
}

const severityOrder: Record<AlertSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export async function getOperationalSnapshot(): Promise<OperationalSnapshot> {
  const [orders, products, sellers, buyers, payments] = await Promise.all([
    listOrders(query),
    listProducts(query),
    listSellers(query),
    listBuyers(query),
    listPayments(query),
  ]);
  const now = Date.now();
  const orderItems = orders.data?.items ?? [];
  const productItems = products.data?.items ?? [];
  const sellerItems = sellers.data?.items ?? [];
  const alerts = [
    ...analyzeOrders(orderItems, now),
    ...analyzeCatalog(productItems, sellerItems),
  ].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const results = [orders, products, sellers, buyers, payments];
  const warnings = results.flatMap((result) => [
    ...(result.error ? [result.error.message] : []),
    ...(result.warning ? [result.warning] : []),
  ]);

  if ([orders, products, sellers, buyers, payments].some((result) => (result.data?.totalPages ?? 1) > 1)) {
    warnings.push("El analisis usa los 100 registros mas recientes de cada fuente.");
  }

  return {
    generatedAt: new Date(now).toISOString(),
    orders: orderItems,
    products: productItems,
    sellers: sellerItems,
    buyers: buyers.data?.items ?? [],
    payments: payments.data?.items ?? [],
    alerts,
    warnings: Array.from(new Set(warnings)),
  };
}
