import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { FilterPanel } from "@/components/FilterPanel";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listProducts, listSellers } from "@/lib/services/seller-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Paginated, Product, ServiceResult } from "@/types/domain";

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

function productMatches(product: Product, sellerId: string, publicationStatus: string) {
  const sellerMatches = sellerId
    ? product.sellerId === sellerId || product.sellerIds?.includes(sellerId)
    : true;
  const publicationMatches = publicationStatus ? product.status === publicationStatus : true;

  return sellerMatches && publicationMatches;
}

function paginateProducts(items: Product[], page: number, pageSize: number): Paginated<Product> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    totalItems,
    totalPages,
  };
}

async function listAllProductsForLocalFilters(
  query: ReturnType<typeof parseListQuery>,
): Promise<ServiceResult<Paginated<Product>>> {
  const pageSize = 50;
  const firstResult = await listProducts({ ...query, page: 1, pageSize });

  if (!firstResult.data) {
    return firstResult;
  }

  const items = [...firstResult.data.items];

  for (let pageNumber = 2; pageNumber <= firstResult.data.totalPages; pageNumber += 1) {
    const nextResult = await listProducts({ ...query, page: pageNumber, pageSize });

    if (!nextResult.data) {
      return {
        ...firstResult,
        warning:
          nextResult.error?.message ??
          "No se pudieron cargar todas las paginas de productos para aplicar el filtro.",
        data: {
          ...firstResult.data,
          items,
        },
      };
    }

    items.push(...nextResult.data.items);
  }

  return {
    ...firstResult,
    data: {
      ...firstResult.data,
      items,
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const selectedSeller = firstParam(params.vendedor) ?? "";
  const selectedPublication = firstParam(params.publicacion) ?? "";
  const hasLocalFilters = Boolean(selectedSeller || selectedPublication);
  const [result, sellers] = await Promise.all([
    hasLocalFilters ? listAllProductsForLocalFilters(query) : listProducts(query),
    listSellers({ q: "", page: 1, pageSize: 50 }),
  ]);
  const filteredProducts = hasLocalFilters
    ? (result.data?.items.filter((product) =>
        productMatches(product, selectedSeller, selectedPublication),
      ) ?? [])
    : (result.data?.items ?? []);
  const page = result.data
    ? hasLocalFilters
      ? paginateProducts(filteredProducts, query.page, query.pageSize)
      : result.data
    : null;
  const publicationOptions = withSelectedOption(
    uniqueOptions(result.data?.items.map((product) => product.status) ?? []),
    selectedPublication,
  );

  const columns: DataTableColumn<Product>[] = [
    {
      key: "title",
      header: "Producto",
      cell: (product) => (
        <div>
          <p className="font-medium">{product.title}</p>
          <p className="mt-1 text-xs text-lama-muted">{product.id}</p>
        </div>
      ),
    },
    {
      key: "seller",
      header: "Vendedor",
      cell: (product) => product.sellerName ?? product.sellerId,
    },
    {
      key: "status",
      header: "Estado",
      cell: (product) => <StatusBadge status={product.status} />,
    },
    {
      key: "price",
      header: "Precio",
      cell: (product) => formatCurrency(product.price),
    },
    {
      key: "detail",
      header: "Detalle",
      cell: (product) =>
        [product.brand, product.size, product.condition].filter(Boolean).join(" · ") || "-",
    },
    {
      key: "createdAt",
      header: "Publicado",
      cell: (product) => formatDate(product.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description="Catalogo consolidado desde Seller App."
      />
      <FilterPanel
        clearHref="/productos"
        fields={[
          {
            type: "search",
            name: "q",
            label: "Busqueda",
            placeholder: "Buscar por titulo de producto",
            defaultValue: query.q,
            className: "lg:col-span-5",
          },
          {
            type: "select",
            name: "vendedor",
            label: "Vendedor",
            defaultValue: selectedSeller,
            className: "lg:col-span-3",
            options: [
              { label: "Todos", value: "" },
              ...(sellers.data?.items.map((seller) => ({
                label: seller.storeName,
                value: seller.clerkUserId ?? seller.id,
              })) ?? []),
            ],
          },
          {
            type: "select",
            name: "publicacion",
            label: "Publicacion",
            defaultValue: selectedPublication,
            className: "lg:col-span-2",
            options: [{ label: "Todos", value: "" }, ...publicationOptions],
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
        data={page?.items ?? []}
        getRowKey={(product) => product.id}
        emptyTitle="No hay productos para mostrar"
        emptyDescription="Conecta Seller App o ajusta la busqueda."
        error={result.error?.message}
      />
      <Pagination
        page={query.page}
        totalPages={page?.totalPages ?? 1}
        basePath="/productos"
        query={toQueryObject(params)}
      />
    </div>
  );
}
