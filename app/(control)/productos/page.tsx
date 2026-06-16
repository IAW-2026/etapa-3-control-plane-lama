import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listProducts } from "@/lib/services/seller-service";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product } from "@/types/domain";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const result = await listProducts(query);
  const page = result.data;

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
        actions={<SearchInput placeholder="Buscar producto" defaultValue={query.q} />}
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
