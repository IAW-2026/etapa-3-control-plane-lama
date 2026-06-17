import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { FilterPanel } from "@/components/FilterPanel";
import { PageHeader } from "@/components/PageHeader";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { parseListQuery, toQueryObject, type SearchParams } from "@/lib/pagination";
import { listBuyers } from "@/lib/services/buyer-service";
import { listSellers } from "@/lib/services/seller-service";
import { formatDate } from "@/lib/utils";
import { BuyerActions } from "./BuyerActions";
import { SellerActions } from "./SellerActions";
import { UserFeedbackPopup } from "./UserFeedbackPopup";

type UserRow = {
  id: string;
  clerkUserId?: string | null;
  name: string;
  dni?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
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
  return ![
    "inactive",
    "inactiva",
    "inactivo",
    "disabled",
    "deshabilitado",
    "deshabilitada",
    "desactivado",
    "desactivada",
  ].includes(status.toLowerCase());
}

function buildReturnPath(params: SearchParams) {
  const query = new URLSearchParams(toQueryObject(params));

  query.delete("sellerStatus");
  query.delete("sellerStatusMessage");

  const queryString = query.toString();
  return queryString ? `/usuarios?${queryString}` : "/usuarios";
}

function buildCleanQuery(params: SearchParams) {
  const query = toQueryObject(params);

  delete query.sellerStatus;
  delete query.sellerStatusMessage;

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

function toBuyerEditorData(row: UserRow) {
  return {
    clerkUserId: row.clerkUserId ?? "",
    name: row.name,
    email: row.email === "-" ? "" : row.email,
    phone: row.phone ?? "",
    address: row.address ?? "",
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
  const selectedStatus = firstParam(params.estado) ?? "";
  const [buyers, sellers] = await Promise.all([listBuyers(query), listSellers(query)]);
  const buyerRows: UserRow[] =
    buyers.data?.items.map((buyer) => ({
      id: buyer.id,
      clerkUserId: buyer.clerkUserId,
      name: buyer.name,
      email: buyer.email || "-",
      phone: buyer.phone,
      address: buyer.address,
      status: buyer.status ?? "active",
      isActive: isActiveStatus(buyer.status ?? "active"),
      metric: buyer.ordersCount > 0 ? `${buyer.ordersCount} ordenes` : "Buyer App",
      type: "Comprador",
      createdAt: buyer.createdAt,
    })) ?? [];
  const sellerRows: UserRow[] =
    sellers.data?.items.map((seller) => ({
      id: seller.id,
      clerkUserId: seller.clerkUserId ?? seller.id,
      name: seller.storeName,
      dni: seller.dni,
      email: seller.email ?? "-",
      phone: seller.phone,
      status: seller.active ? "active" : "inactive",
      isActive: seller.active,
      metric: "Seller App",
      type: "Vendedor",
      createdAt: seller.createdAt,
    })) ?? [];
  const rows = [...buyerRows, ...sellerRows].filter((row) => {
    if (!selectedStatus) {
      return true;
    }

    return selectedStatus === "active" ? row.isActive : !row.isActive;
  });
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
    {
      key: "actions",
      header: "Acciones",
      cell: (row) => {
        if (row.type === "Comprador") {
          return <BuyerActions buyer={toBuyerEditorData(row)} returnTo={returnTo} />;
        }

        return <SellerActions seller={toSellerEditorData(row)} returnTo={returnTo} />;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Compradores y vendedores reales expuestos por Buyer App y Seller App."
      />
      <FilterPanel
        clearHref="/usuarios"
        fields={[
          {
            type: "search",
            name: "q",
            label: "Busqueda",
            placeholder: "Buscar por nombre o email",
            defaultValue: query.q,
            className: "lg:col-span-7",
          },
          {
            type: "select",
            name: "estado",
            label: "Estado",
            defaultValue: selectedStatus,
            className: "lg:col-span-3",
            options: [
              { label: "Todos", value: "" },
              { label: "Activos", value: "active" },
              { label: "Inactivos", value: "inactive" },
            ],
          },
        ]}
      />
      <UserFeedbackPopup status={sellerStatus} message={sellerStatusMessage} />
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
