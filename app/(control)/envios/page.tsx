import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listShipments } from "@/lib/services/shipping-service";
import { formatDate } from "@/lib/utils";
import type { Shipment } from "@/types/domain";

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const result = await listShipments(query);
  const page = result.data;

  const columns: DataTableColumn<Shipment>[] = [
    {
      key: "id",
      header: "Envio",
      cell: (shipment) => <span className="font-medium">{shipment.id}</span>,
    },
    {
      key: "order",
      header: "Orden",
      cell: (shipment) => shipment.orderId,
    },
    {
      key: "carrier",
      header: "Operador",
      cell: (shipment) => shipment.carrier,
    },
    {
      key: "tracking",
      header: "Tracking",
      cell: (shipment) => shipment.trackingCode,
    },
    {
      key: "status",
      header: "Estado",
      cell: (shipment) => <StatusBadge status={shipment.status} />,
    },
    {
      key: "updatedAt",
      header: "Actualizado",
      cell: (shipment) => formatDate(shipment.updatedAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Envios"
        description="Seguimiento operativo desde Shipping App."
      />
      {result.warning ? (
        <div className="rounded-[22px] border border-lama-border bg-lama-surface/80 p-5 text-sm font-medium leading-6 text-lama-muted shadow-soft">
          {result.warning}
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={page?.items ?? []}
        getRowKey={(shipment) => shipment.id}
        emptyTitle="No hay envios para mostrar"
        emptyDescription="Conecta Seller App y Shipping App."
        error={result.error?.message}
      />
      <Pagination
        page={query.page}
        totalPages={page?.totalPages ?? 1}
        basePath="/envios"
        query={toQueryObject(params)}
      />
    </div>
  );
}
