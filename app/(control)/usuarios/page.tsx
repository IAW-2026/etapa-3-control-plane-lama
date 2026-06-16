import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { SearchInput } from "@/components/SearchInput";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listBuyers } from "@/lib/services/buyer-service";
import { listSellers } from "@/lib/services/seller-service";
import { formatDate } from "@/lib/utils";
import { SellerActions } from "./SellerActions";
import { SellerIdentityCell, SellerStatusCell } from "./SellerCells";

type UserRow = {
  id: string;
  clerkUserId?: string | null;
  name: string;
  dni?: string | null;
  email: string;
  phone?: string | null;
  status: string;
  isActive: boolean;
  metric: string;
  type: "Comprador" | "Vendedor";
  createdAt?: string | null;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isActiveStatus(status: string) {
  return !["inactive", "inactiva", "disabled", "deshabilitado", "deshabilitada"].includes(
    status.toLowerCase(),
  );
}

function buildReturnPath(params: SearchParams) {
  const query = new URLSearchParams(toQueryObject(params));

  query.delete("sellerStatus");
  query.delete("sellerStatusMessage");
  query.delete("updatedSellerId");
  query.delete("updatedSellerActive");

  const queryString = query.toString();
  return queryString ? `/usuarios?${queryString}` : "/usuarios";
}

function buildCleanQuery(params: SearchParams) {
  const query = toQueryObject(params);

  delete query.sellerStatus;
  delete query.sellerStatusMessage;
  delete query.updatedSellerId;
  delete query.updatedSellerActive;

  return query;
}

function toSellerEditorData(row: UserRow) {
  return {
    clerkUserId: row.clerkUserId ?? row.id,
    name: row.name,
    dni: row.dni ?? "",
    email: row.email === "-" ? "" : row.email,
    phone: row.phone ?? "",
    active: row.isActive,
  };
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = parseListQuery(params);
  const returnTo = buildReturnPath(params);
  const paginationQuery = buildCleanQuery(params);
  const sellerStatus = firstParam(params.sellerStatus);
  const sellerStatusMessage = firstParam(params.sellerStatusMessage);
  const updatedSellerId = firstParam(params.updatedSellerId);
  const updatedSellerActive = firstParam(params.updatedSellerActive);
  const [buyers, sellers] = await Promise.all([listBuyers(query), listSellers(query)]);
  const buyerRows: UserRow[] =
    buyers.data?.items.map((buyer) => ({
      id: buyer.id,
      name: buyer.name,
      email: buyer.email || "-",
      status: buyer.status ?? "active",
      isActive: isActiveStatus(buyer.status ?? "active"),
      metric: buyer.ordersCount > 0 ? `${buyer.ordersCount} ordenes` : "Buyer App",
      type: "Comprador",
      createdAt: buyer.createdAt,
    })) ?? [];
  const sellerRows: UserRow[] =
    sellers.data?.items.map((seller) => {
      const clerkUserId = seller.clerkUserId ?? seller.id;
      const active =
        updatedSellerId === clerkUserId && updatedSellerActive
          ? updatedSellerActive === "true"
          : seller.active;

      return {
        id: seller.id,
        clerkUserId,
        name: seller.storeName,
        dni: seller.dni,
        email: seller.email ?? "-",
        phone: seller.phone,
        status: active ? "active" : "inactive",
        isActive: active,
        metric: "Seller App",
        type: "Vendedor",
        createdAt: seller.createdAt,
      };
    }) ?? [];
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
      cell: (row) =>
        row.type === "Vendedor" ? (
          <SellerIdentityCell seller={toSellerEditorData(row)} />
        ) : (
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
      cell: (row) =>
        row.type === "Vendedor" ? (
          <SellerStatusCell seller={toSellerEditorData(row)} />
        ) : (
          <StatusBadge status={row.status} />
        ),
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
    {
      key: "actions",
      header: "Acciones",
      cell: (row) => {
        if (row.type !== "Vendedor") {
          return <span className="text-xs font-semibold text-lama-muted">-</span>;
        }

        return (
          <SellerActions
            seller={toSellerEditorData(row)}
            returnTo={returnTo}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Compradores y vendedores reales expuestos por Buyer App y Seller App."
        actions={<SearchInput placeholder="Buscar usuario" defaultValue={query.q} />}
      />
      {sellerStatusMessage ? (
        <div
          className={
            sellerStatus === "error"
              ? "rounded-[22px] border border-red-200 bg-red-50/70 p-5 text-sm font-medium leading-6 text-red-900 shadow-soft"
              : "rounded-[22px] border border-emerald-200 bg-emerald-50/70 p-5 text-sm font-medium leading-6 text-emerald-900 shadow-soft"
          }
        >
          {sellerStatusMessage}
        </div>
      ) : null}
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
        query={paginationQuery}
      />
    </div>
  );
}
