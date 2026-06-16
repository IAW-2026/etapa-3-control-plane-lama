import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listPayments } from "@/lib/services/payments-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Payment } from "@/types/domain";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const result = await listPayments(query);
  const page = result.data;

  const columns: DataTableColumn<Payment>[] = [
    {
      key: "id",
      header: "Pago",
      cell: (payment) => <span className="font-medium">{payment.id}</span>,
    },
    {
      key: "order",
      header: "Orden",
      cell: (payment) => payment.orderId,
    },
    {
      key: "provider",
      header: "Proveedor",
      cell: (payment) => payment.provider,
    },
    {
      key: "status",
      header: "Estado",
      cell: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      key: "amount",
      header: "Monto",
      cell: (payment) => formatCurrency(payment.amount, payment.currency),
    },
    {
      key: "createdAt",
      header: "Fecha",
      cell: (payment) => formatDate(payment.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos"
        description="Estado de pagos consolidado desde las ordenes reportadas por Seller App."
      />
      {result.warning ? (
        <div className="rounded-[22px] border border-lama-border bg-lama-surface/80 p-5 text-sm font-medium leading-6 text-lama-muted shadow-soft">
          {result.warning}
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={page?.items ?? []}
        getRowKey={(payment) => payment.id}
        emptyTitle="No hay pagos para mostrar"
        emptyDescription="Conecta Seller App."
        error={result.error?.message}
      />
      <Pagination
        page={query.page}
        totalPages={page?.totalPages ?? 1}
        basePath="/pagos"
        query={toQueryObject(params)}
      />
    </div>
  );
}
