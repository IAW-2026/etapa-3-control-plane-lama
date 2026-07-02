import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { FilterPanel } from "@/components/FilterPanel";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listShipments } from "@/lib/services/shipping-service";
import { formatDate } from "@/lib/utils";
import type { Shipment } from "@/types/domain";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function humanizeStatus(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function uniqueOptions(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).map(
    (value) => ({
      label: humanizeStatus(value),
      value,
    }),
  );
}

function withSelectedOption(options: ReturnType<typeof uniqueOptions>, selected: string) {
  return selected && !options.some((option) => option.value === selected)
    ? [...options, { label: humanizeStatus(selected), value: selected }]
    : options;
}

function toDateKey(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

export default async function ShipmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const selectedSearch = firstParam(params.search)?.trim() ?? "";
  const selectedStatus = firstParam(params.estado) ?? "";
  const selectedCarrier = firstParam(params.operador) ?? "";
  const dateFrom = firstParam(params.desde) ?? "";
  const dateTo = firstParam(params.hasta) ?? "";
  const result = await listShipments(query);
  const page = result.data;

  const filteredShipments =
    page?.items.filter((shipment) => {
      const searchTerm = selectedSearch.toLowerCase();
      const searchMatches = searchTerm
        ? shipment.orderId.toLowerCase().includes(searchTerm) ||
          shipment.trackingCode.toLowerCase().includes(searchTerm)
        : true;
      const statusMatches = selectedStatus ? shipment.status === selectedStatus : true;
      const carrierMatches = selectedCarrier ? shipment.carrier === selectedCarrier : true;
      const updatedKey = toDateKey(shipment.updatedAt);
      const fromMatches = dateFrom ? Boolean(updatedKey) && updatedKey! >= dateFrom : true;
      const toMatches = dateTo ? Boolean(updatedKey) && updatedKey! <= dateTo : true;

      return searchMatches && statusMatches && carrierMatches && fromMatches && toMatches;
    }) ?? [];
  const statusOptions = withSelectedOption(
    uniqueOptions(page?.items.map((shipment) => shipment.status) ?? []),
    selectedStatus,
  );
  const carrierOptions = withSelectedOption(
    uniqueOptions(page?.items.map((shipment) => shipment.carrier) ?? []),
    selectedCarrier,
  );

  const columns: DataTableColumn<Shipment>[] = [
    {
      key: "id",
      header: "Envio",
      widthClassName: "w-[130px]",
      cell: (shipment) => (
        <span className="block truncate font-medium" title={shipment.id}>
          {shipment.id}
        </span>
      ),
    },
    {
      key: "order",
      header: "Orden",
      widthClassName: "w-[130px]",
      cell: (shipment) => (
        <span className="block truncate" title={shipment.orderId}>
          {shipment.orderId}
        </span>
      ),
    },
    {
      key: "carrier",
      header: "Operador",
      widthClassName: "w-[160px]",
      cell: (shipment) => (
        <span className="block truncate" title={shipment.carrier}>
          {shipment.carrier}
        </span>
      ),
    },
    {
      key: "tracking",
      header: "Tracking",
      widthClassName: "w-[170px]",
      cell: (shipment) => (
        <span className="block truncate" title={shipment.trackingCode}>
          {shipment.trackingCode}
        </span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      widthClassName: "w-[150px]",
      cell: (shipment) => <StatusBadge status={shipment.status} />,
    },
    {
      key: "updatedAt",
      header: "Actualizado",
      widthClassName: "w-[130px]",
      cell: (shipment) => formatDate(shipment.updatedAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Envios"
        description="Seguimiento operativo desde Shipping App."
      />
      <FilterPanel
        clearHref="/envios"
        fields={[
          {
            type: "search",
            name: "search",
            label: "Busqueda",
            placeholder: "Buscar por orden o tracking",
            defaultValue: selectedSearch,
            className: "lg:col-span-2",
          },
          {
            type: "select",
            name: "estado",
            label: "Estado",
            defaultValue: selectedStatus,
            className: "lg:col-span-2",
            options: [{ label: "Todos", value: "" }, ...statusOptions],
          },
          {
            type: "select",
            name: "operador",
            label: "Operador",
            defaultValue: selectedCarrier,
            className: "lg:col-span-2",
            options: [{ label: "Todos", value: "" }, ...carrierOptions],
          },
          {
            type: "date",
            name: "desde",
            label: "Actualizado desde",
            defaultValue: dateFrom,
            className: "lg:col-span-2",
          },
          {
            type: "date",
            name: "hasta",
            label: "Actualizado hasta",
            defaultValue: dateTo,
            className: "lg:col-span-2",
          },
        ]}
      />
      <DataTable
        columns={columns}
        data={filteredShipments}
        getRowKey={(shipment) => shipment.id}
        emptyTitle="No hay envios para mostrar"
        emptyDescription="Ajusta los filtros o revisa la conexion con Seller App y Shipping App."
        error={result.error?.message}
        tableClassName="table-fixed"
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
