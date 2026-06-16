import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { getDashboardStats } from "@/lib/services/dashboard-service";

export default async function DashboardPage() {
  const { stats } = await getDashboardStats();
  const integrations = [
    { label: "Seller", status: "Sincronizado", tone: "ok" },
    { label: "Shipping", status: "Por orden", tone: "ok" },
    { label: "Buyer", status: "Parcial", tone: "soft" },
    { label: "Payments", status: "Derivado", tone: "soft" },
  ];

  return (
    <div className="space-y-10">
      <PageHeader
        title="Panel de Administracion"
        description="Vista global de vendedores, productos, ordenes, envios y pagos del ecosistema LAMA."
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <StatCard
          title="Compradores"
          value={stats.buyers}
          helper="Fuente parcial"
          icon={<UserRound className="h-6 w-6" aria-hidden />}
        />
        <StatCard
          title="Vendedores"
          value={stats.sellers}
          helper="Seller App"
          icon={<Users className="h-6 w-6" aria-hidden />}
        />
        <StatCard
          title="Productos"
          value={stats.products}
          helper="Catalogo activo"
          icon={<Package className="h-6 w-6" aria-hidden />}
        />
        <StatCard
          title="Ordenes"
          value={stats.orders}
          helper="Ventas registradas"
          icon={<ShoppingBag className="h-6 w-6" aria-hidden />}
        />
        <StatCard
          title="Envios"
          value={stats.shipments}
          helper="Shipping App"
          icon={<Truck className="h-6 w-6" aria-hidden />}
        />
        <StatCard
          title="Pagos"
          value={stats.payments}
          helper="Estado de orden"
          icon={<CreditCard className="h-6 w-6" aria-hidden />}
        />
        <StatCard
          title="Disputas"
          value={stats.disputes}
          helper="Sin endpoint"
          icon={<AlertTriangle className="h-6 w-6" aria-hidden />}
        />
      </section>

      <section className="rounded-[24px] border border-lama-border bg-lama-surface/90 p-6 shadow-panel">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-lama-primary">
              Estado de integraciones
            </p>
            <p className="mt-2 text-sm leading-6 text-lama-muted">
              Servicios conectados al Control Plane para la operacion global.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {integrations.map((integration) => (
              <div
                key={integration.label}
                className="flex min-w-[180px] items-center gap-3 rounded-[18px] border border-lama-border bg-white/78 px-4 py-3"
              >
                {integration.tone === "ok" ? (
                  <CheckCircle2 className="h-5 w-5 text-lama-primary" aria-hidden />
                ) : (
                  <RefreshCw className="h-5 w-5 text-lama-muted" aria-hidden />
                )}
                <div>
                  <p className="text-sm font-black text-lama-text">{integration.label}</p>
                  <p className="text-xs font-semibold text-lama-muted">{integration.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
