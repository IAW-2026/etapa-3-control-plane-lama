import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { getConsolidatedOrder } from "@/lib/services/order-service";
import { formatCurrency, formatDate } from "@/lib/utils";

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-lama-border bg-lama-surface/95 p-7 shadow-panel">
      <h2 className="text-xs font-black uppercase tracking-[0.24em] text-lama-primary">{title}</h2>
      <div className="mt-4 space-y-3 text-sm">{children}</div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-lama-border/70 pb-3 last:border-0 last:pb-0">
      <span className="text-lama-muted">{label}</span>
      <span className="text-right font-medium text-lama-text">{value}</span>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getConsolidatedOrder(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Orden ${id}`}
        description="Detalle consolidado desde Seller, Buyer, Payments y Shipping cuando los endpoints estan disponibles."
        actions={
          <Link
            href="/ordenes"
            className="inline-flex items-center gap-2 rounded-[14px] border border-lama-border bg-white px-4 py-3 text-sm font-bold transition hover:border-lama-primary hover:bg-lama-primary/10"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Volver
          </Link>
        }
      />

      {detail.errors.length > 0 ? (
        <div className="rounded-[22px] border border-lama-border bg-lama-surface/80 p-5 text-sm font-medium leading-6 text-lama-muted shadow-soft">
          Datos parciales: {detail.errors.map((error) => error.message).join(" ")}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard title="Orden">
          <Field
            label="Estado general"
            value={detail.order ? <StatusBadge status={detail.order.status} /> : "-"}
          />
          <Field
            label="Estado de pago"
            value={detail.order ? <StatusBadge status={detail.order.paymentStatus} /> : "-"}
          />
          <Field
            label="Estado de envio"
            value={detail.order ? <StatusBadge status={detail.order.shippingStatus} /> : "-"}
          />
          <Field
            label="Total"
            value={detail.order ? formatCurrency(detail.order.total, detail.order.currency) : "-"}
          />
          <Field label="Fecha" value={formatDate(detail.order?.createdAt)} />
        </DetailCard>

        <DetailCard title="Comprador">
          <Field label="ID" value={detail.buyer?.id ?? detail.order?.buyerId ?? "-"} />
          <Field label="Nombre" value={detail.buyer?.name ?? "-"} />
          <Field label="Email" value={detail.buyer?.email ?? "-"} />
        </DetailCard>

        <DetailCard title="Vendedor">
          <Field label="ID" value={detail.seller?.id ?? detail.order?.sellerId ?? "-"} />
          <Field label="Nombre" value={detail.seller?.storeName ?? "-"} />
        </DetailCard>

        <DetailCard title="Pago">
          <Field
            label="Estado"
            value={detail.payment ? <StatusBadge status={detail.payment.status} /> : "-"}
          />
          <Field
            label="Monto"
            value={
              detail.payment ? formatCurrency(detail.payment.amount, detail.payment.currency) : "-"
            }
          />
          <Field label="Proveedor" value={detail.payment?.provider ?? "-"} />
          <Field label="Origen" value={detail.payment?.source ?? "-"} />
        </DetailCard>

        <DetailCard title="Envio">
          <Field
            label="Estado"
            value={detail.shipment ? <StatusBadge status={detail.shipment.status} /> : "-"}
          />
          <Field label="Correo" value={detail.shipment?.carrier ?? "-"} />
          <Field label="Tracking" value={detail.shipment?.trackingCode ?? "-"} />
        </DetailCard>
      </div>
    </div>
  );
}
