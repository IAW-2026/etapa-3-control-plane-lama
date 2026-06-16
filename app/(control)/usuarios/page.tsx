import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listBuyers } from "@/lib/services/buyer-service";
import { listSellers } from "@/lib/services/seller-service";
import { formatDate } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  metric: string;
  type: "Comprador" | "Vendedor";
  createdAt?: string | null;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const [buyers, sellers] = await Promise.all([listBuyers(query), listSellers(query)]);
  const buyerRows: UserRow[] =
    buyers.data?.items.map((buyer) => ({
      id: buyer.id,
      name: buyer.name,
      email: buyer.email || "-",
      status: buyer.status ?? "active",
      metric: buyer.ordersCount > 0 ? `${buyer.ordersCount} ordenes` : "Buyer App",
      type: "Comprador",
      createdAt: buyer.createdAt,
    })) ?? [];
  const sellerRows: UserRow[] =
    sellers.data?.items.map((seller) => ({
      id: seller.id,
      name: seller.storeName,
      email: seller.email ?? "-",
      status: seller.status,
      metric: "Seller App",
      type: "Vendedor",
      createdAt: seller.createdAt,
    })) ?? [];
  const rows = [...buyerRows, ...sellerRows];
  const partialErrors = [
    buyers.error ? `Buyer App: ${buyers.error.message}` : null,
    sellers.error ? `Seller App: ${sellers.error.message}` : null,
  ].filter(Boolean);
  const tableError = rows.length === 0 ? partialErrors.join(" ") || undefined : undefined;
  const totalPages = Math.max(buyers.data?.totalPages ?? 1, sellers.data?.totalPages ?? 1);

  const columns: DataTableColumn<UserRow>[] = [
    {
      key: "name",
      header: "Usuario",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="mt-1 text-xs text-lama-muted">{row.email}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipo",
      cell: (row) => row.type,
    },
    {
      key: "status",
      header: "Estado",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "metric",
      header: "Fuente",
      cell: (row) => row.metric,
    },
    {
      key: "createdAt",
      header: "Alta",
      cell: (row) => formatDate(row.createdAt),
    },
    {
      key: "id",
      header: "ID",
      cell: (row) => row.id,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Compradores y vendedores reales expuestos por Buyer App y Seller App."
        actions={<SearchInput placeholder="Buscar usuario" defaultValue={query.q} />}
      />
      <div className="rounded-[22px] border border-lama-border bg-lama-surface/80 p-5 text-sm font-medium leading-6 text-lama-muted shadow-soft">
        La activacion o desactivacion de vendedores no esta disponible porque Seller App no expone ese endpoint en el contrato actual.
      </div>
      {partialErrors.length > 0 && rows.length > 0 ? (
        <div className="rounded-[22px] border border-amber-200 bg-amber-50/70 p-5 text-sm font-medium leading-6 text-amber-900 shadow-soft">
          Una de las fuentes de usuarios no respondio. Se muestran los datos disponibles.
        </div>
      ) : null}
      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => `${row.type}-${row.id}`}
        emptyTitle="No hay usuarios para mostrar"
        emptyDescription="Ajusta la busqueda o revisa la conexion con Buyer App y Seller App."
        error={tableError}
      />
      <Pagination
        page={query.page}
        totalPages={totalPages}
        basePath="/usuarios"
        query={toQueryObject(params)}
      />
    </div>
  );
}
