import Link from "next/link";
import { AlertTriangle, ArrowRight, CircleAlert, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { getOperationalSnapshot } from "@/lib/services/anomaly-service";
import type { AlertSeverity } from "@/types/domain";

const severityLabels: Record<AlertSeverity, string> = {
  critical: "Critica",
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

const severityStyles: Record<AlertSeverity, string> = {
  critical: "border-red-300 bg-red-50 text-red-800",
  high: "border-orange-300 bg-orange-50 text-orange-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  low: "border-sky-200 bg-sky-50 text-sky-800",
};

export default async function AlertsPage() {
  const snapshot = await getOperationalSnapshot();
  const counts = snapshot.alerts.reduce<Record<AlertSeverity, number>>(
    (result, item) => ({ ...result, [item.severity]: result[item.severity] + 1 }),
    { critical: 0, high: 0, medium: 0, low: 0 },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas inteligentes"
        description="Anomalias detectadas con reglas auditables sobre ordenes, pagos, envios, catalogo y vendedores."
        actions={(
          <Link href="/copiloto" className="rounded-2xl bg-lama-primary px-5 py-3 text-sm font-black text-white shadow-soft">
            Consultar al copiloto
          </Link>
        )}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(counts) as AlertSeverity[]).map((severity) => (
          <div key={severity} className={`rounded-[20px] border p-5 ${severityStyles[severity]}`}>
            <p className="text-xs font-black uppercase tracking-[0.18em]">{severityLabels[severity]}</p>
            <p className="mt-2 text-3xl font-black">{counts[severity]}</p>
          </div>
        ))}
      </section>

      {snapshot.warnings.length ? (
        <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          <div className="flex gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>{snapshot.warnings.map((warning) => <p key={warning}>{warning}</p>)}</div>
          </div>
        </div>
      ) : null}

      <section className="space-y-4">
        {!snapshot.alerts.length ? (
          <div className="flex flex-col items-center rounded-[26px] border border-emerald-200 bg-emerald-50 px-6 py-16 text-center text-emerald-800 shadow-soft">
            <ShieldCheck className="h-10 w-10" aria-hidden />
            <h2 className="mt-4 text-xl font-black">No se detectaron anomalias</h2>
            <p className="mt-2 text-sm">Los datos disponibles no activaron ninguna regla operativa.</p>
          </div>
        ) : snapshot.alerts.map((item) => (
          <article key={item.id} className="rounded-[24px] border border-lama-border bg-lama-surface p-6 shadow-soft">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${severityStyles[item.severity]}`}>
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${severityStyles[item.severity]}`}>
                      {severityLabels[item.severity]}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-lama-muted">{item.category}</span>
                  </div>
                  <h2 className="mt-3 text-lg font-black">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-lama-muted">{item.description}</p>
                  <p className="mt-3 text-sm font-bold leading-6 text-lama-text">Sugerencia: {item.recommendation}</p>
                </div>
              </div>
              <Link href={item.href} className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-lama-border bg-white px-4 py-2.5 text-xs font-black hover:border-lama-primary">
                Ver {item.entityType} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
