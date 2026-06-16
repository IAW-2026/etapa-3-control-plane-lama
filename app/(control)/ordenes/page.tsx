import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listOrders } from "@/lib/services/seller-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types/domain";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const result = await listOrders(query);
  const page = result.data;

  const columns: DataTableColumn<Order>[] = [
    {
      key: "id",
      header: "Orden",
      cell: (order) => <span className="font-medium">{order.id}</span>,
    },
    {
      key: "buyer",
      header: "Comprador",
      cell: (order) => order.buyerId,
    },
    {
      key: "paymentStatus",
      header: "Pago",
      cell: (order) => <StatusBadge status={order.paymentStatus} />,
    },
    {
      key: "shippingStatus",
      header: "Envio",
      cell: (order) => <StatusBadge status={order.shippingStatus} />,
    },
    {
      key: "status",
      header: "Orden",
      cell: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: "total",
      header: "Total",
      cell: (order) => formatCurrency(order.total, order.currency),
    },
    {
      key: "createdAt",
      header: "Fecha",
      cell: (order) => formatDate(order.createdAt),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (order) => (
        <Link
          href={`/ordenes/${order.id}`}
          className="inline-flex items-center gap-1 rounded-[14px] border border-lama-border bg-white px-4 py-2 text-xs font-bold transition hover:border-lama-primary hover:bg-lama-primary/10"
        >
          Detalle
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ordenes"
        description="Pedidos operativos con acceso al detalle consolidado."
      />
      {result.warning ? (
        <div className="rounded-[22px] border border-lama-border bg-lama-surface/80 p-5 text-sm font-medium leading-6 text-lama-muted shadow-soft">
          {result.warning}
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={page?.items ?? []}
        getRowKey={(order) => order.id}
        emptyTitle="No hay ordenes para mostrar"
        emptyDescription="Conecta Seller App."
        error={result.error?.message}
      />
      <Pagination
        page={query.page}
        totalPages={page?.totalPages ?? 1}
        basePath="/ordenes"
        query={toQueryObject(params)}
      />
    </div>
  );
}
