import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { FilterPanel } from "@/components/FilterPanel";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listOrders } from "@/lib/services/seller-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types/domain";

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

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const selectedGeneralStatus = firstParam(params.estado_general) ?? "";
  const selectedPaymentStatus = firstParam(params.estado_pago) ?? "";
  const selectedShippingStatus = firstParam(params.estado_envio) ?? "";
  const result = await listOrders(query);
  const page = result.data;
  const filteredOrders =
    page?.items.filter((order) => {
      const searchMatches = query.q
        ? order.id.toLowerCase().includes(query.q.toLowerCase().trim())
        : true;
      const generalMatches = selectedGeneralStatus ? order.status === selectedGeneralStatus : true;
      const paymentMatches = selectedPaymentStatus
        ? order.paymentStatus === selectedPaymentStatus
        : true;
      const shippingMatches = selectedShippingStatus
        ? order.shippingStatus === selectedShippingStatus
        : true;

      return searchMatches && generalMatches && paymentMatches && shippingMatches;
    }) ?? [];
  const generalStatusOptions = withSelectedOption(
    uniqueOptions(page?.items.map((order) => order.status) ?? []),
    selectedGeneralStatus,
  );
  const paymentStatusOptions = withSelectedOption(
    uniqueOptions(page?.items.map((order) => order.paymentStatus) ?? []),
    selectedPaymentStatus,
  );
  const shippingStatusOptions = withSelectedOption(
    uniqueOptions(page?.items.map((order) => order.shippingStatus) ?? []),
    selectedShippingStatus,
  );

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
      <FilterPanel
        clearHref="/ordenes"
        fields={[
          {
            type: "search",
            name: "q",
            label: "Busqueda",
            placeholder: "Buscar por nro de orden",
            defaultValue: query.q,
            className: "lg:col-span-4",
          },
          {
            type: "select",
            name: "estado_general",
            label: "Estado general",
            defaultValue: selectedGeneralStatus,
            className: "lg:col-span-2",
            options: [{ label: "Todos", value: "" }, ...generalStatusOptions],
          },
          {
            type: "select",
            name: "estado_pago",
            label: "Estado pago",
            defaultValue: selectedPaymentStatus,
            className: "lg:col-span-2",
            options: [{ label: "Todos", value: "" }, ...paymentStatusOptions],
          },
          {
            type: "select",
            name: "estado_envio",
            label: "Estado envio",
            defaultValue: selectedShippingStatus,
            className: "lg:col-span-2",
            options: [{ label: "Todos", value: "" }, ...shippingStatusOptions],
          },
        ]}
      />
      {result.warning ? (
        <div className="rounded-[22px] border border-lama-border bg-lama-surface/80 p-5 text-sm font-medium leading-6 text-lama-muted shadow-soft">
          {result.warning}
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={filteredOrders}
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
