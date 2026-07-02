import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { FilterPanel } from "@/components/FilterPanel";
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
      widthClassName: "w-[110px]",
      cell: (payment) => (
        <span className="block truncate font-medium" title={payment.id}>
          {payment.id}
        </span>
      ),
    },
    {
      key: "order",
      header: "Orden",
      widthClassName: "w-[110px]",
      cell: (payment) => (
        <span className="block truncate" title={payment.orderId}>
          {payment.orderId}
        </span>
      ),
    },
    {
      key: "provider",
      header: "Proveedor",
      widthClassName: "w-[110px]",
      cell: (payment) => (
        <span className="block truncate" title={payment.provider}>
          {payment.provider}
        </span>
      ),
    },
    {
      key: "buyer",
      header: "Comprador",
      widthClassName: "w-[140px]",
      cell: (payment) => {
        const buyer = payment.buyerName ?? payment.buyerId ?? "-";
        return (
          <span className="block truncate" title={buyer}>
            {buyer}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Estado",
      widthClassName: "w-[110px]",
      cell: (payment) => <StatusBadge status={payment.status} />,
    },
    {
      key: "amount",
      header: "Monto",
      widthClassName: "w-[100px]",
      cell: (payment) => formatCurrency(payment.amount, payment.currency),
    },
    {
      key: "settled",
      header: "Liquidacion",
      widthClassName: "w-[120px]",
      cell: (payment) => <StatusBadge status={payment.settled ? "settled" : "pending"} />,
    },
    {
      key: "createdAt",
      header: "Fecha",
      widthClassName: "w-[100px]",
      cell: (payment) => formatDate(payment.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pagos"
        description="Pagos y liquidaciones consultados directamente desde Payments App."
      />
      <FilterPanel
        clearHref="/pagos"
        fields={[{
          type: "search",
          name: "q",
          label: "Busqueda",
          placeholder: "Buscar pago, orden, comprador o vendedor",
          defaultValue: query.q,
          className: "lg:col-span-6",
        }]}
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
        emptyDescription="Conecta Payments App o ajusta la busqueda."
        error={result.error?.message}
        density="compact"
        tableClassName="table-fixed"
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
