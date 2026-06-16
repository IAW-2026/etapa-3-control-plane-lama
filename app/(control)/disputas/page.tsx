import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listDisputes } from "@/lib/services/payments-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Dispute } from "@/types/domain";

export default async function DisputesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const result = await listDisputes(query);
  const page = result.data;

  const columns: DataTableColumn<Dispute>[] = [
    {
      key: "id",
      header: "Disputa",
      cell: (dispute) => <span className="font-medium">{dispute.id}</span>,
    },
    {
      key: "order",
      header: "Orden",
      cell: (dispute) => dispute.orderId,
    },
    {
      key: "reason",
      header: "Motivo",
      cell: (dispute) => dispute.reason,
      className: "min-w-[240px] whitespace-normal",
    },
    {
      key: "status",
      header: "Estado",
      cell: (dispute) => <StatusBadge status={dispute.status} />,
    },
    {
      key: "amount",
      header: "Monto",
      cell: (dispute) => formatCurrency(dispute.amount),
    },
    {
      key: "createdAt",
      header: "Fecha",
      cell: (dispute) => formatDate(dispute.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disputas"
        description="Casos operativos consumidos desde Payments App cuando el endpoint esta disponible."
      />
      {result.warning ? (
        <div className="rounded-[22px] border border-lama-border bg-lama-surface/80 p-5 text-sm font-medium leading-6 text-lama-muted shadow-soft">
          {result.warning}
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={page?.items ?? []}
        getRowKey={(dispute) => dispute.id}
        emptyTitle="No hay disputas para mostrar"
        emptyDescription="Payments App no expone disputas en el contrato actual."
        error={result.error?.message}
      />
      <Pagination
        page={query.page}
        totalPages={page?.totalPages ?? 1}
        basePath="/disputas"
        query={toQueryObject(params)}
      />
    </div>
  );
}
