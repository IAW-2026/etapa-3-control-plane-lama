import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listSellers } from "@/lib/services/seller-service";
import { formatDate } from "@/lib/utils";

type UserRow = {
  id: string;
  name: string;
  email: string;
  status: string;
  metric: string;
  createdAt?: string | null;
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const sellers = await listSellers(query);
  const rows: UserRow[] =
    sellers.data?.items.map((seller) => ({
      id: seller.id,
      name: seller.storeName,
      email: seller.email ?? "-",
      status: seller.status,
      metric: "Listado expuesto por Seller App",
      createdAt: seller.createdAt,
    })) ?? [];

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
      cell: () => "Vendedor",
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
        description="Vendedores activos expuestos por Seller App. Buyer App no publica un listado global de compradores en el contrato actual."
        actions={<SearchInput placeholder="Buscar vendedor" defaultValue={query.q} />}
      />
      <div className="rounded-[22px] border border-lama-border bg-lama-surface/80 p-5 text-sm font-medium leading-6 text-lama-muted shadow-soft">
        La activacion o desactivacion de vendedores no esta disponible porque Seller App no expone ese endpoint en el contrato actual.
      </div>
      <DataTable
        columns={columns}
        data={rows}
        getRowKey={(row) => row.id}
        emptyTitle="No hay vendedores para mostrar"
        emptyDescription="Ajusta la busqueda o conecta Seller App."
        error={sellers.error?.message}
      />
      <Pagination
        page={query.page}
        totalPages={sellers.data?.totalPages ?? 1}
        basePath="/usuarios"
        query={toQueryObject(params)}
      />
    </div>
  );
}
