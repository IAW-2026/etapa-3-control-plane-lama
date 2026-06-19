import { CheckCircle2, CircleAlert, Database, KeyRound, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { appConfig } from "@/lib/config";
import { getControlPlaneConfiguration } from "@/lib/services/configuration-service";

export default async function ConfigurationPage() {
  const services = await getControlPlaneConfiguration();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuracion"
        description="Estado de conexion del Control Plane con las apps del ecosistema LAMA."
      />

      <section className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <article
            key={service.service}
            className="rounded-[24px] border border-lama-border bg-lama-surface/95 p-7 shadow-panel"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-black text-lama-text">{service.service}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-lama-muted">
                  {service.envKeys.join(" | ")}
                </p>
              </div>
              {service.configured ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
              ) : (
                <CircleAlert className="h-5 w-5 text-amber-600" aria-hidden />
              )}
            </div>
            <div className="mt-4">
              <StatusBadge status={service.configured ? "active" : "pending"} />
            </div>
            <p className="mt-4 break-all text-sm text-lama-muted">
              {service.baseUrl ?? "No configurado"}
            </p>
            <p className="mt-2 text-xs text-lama-muted">
              {service.apiKeyEnv}: {service.apiKeyConfigured ? "configurado" : "no configurado"}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-[24px] border border-lama-border bg-lama-surface/95 p-7 shadow-panel">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-lama-muted" aria-hidden />
            <h2 className="text-sm font-semibold text-lama-text">Identidad del Control Plane</h2>
          </div>
          <p className="mt-4 text-sm text-lama-muted">
            INTERNAL_API_KEY / CONTROL_PLANE_API_KEY{" "}
            {appConfig.controlPlaneApiKey ? "configurado" : "no configurado"}.
          </p>
        </article>
        <article className="rounded-[24px] border border-lama-border bg-lama-surface/95 p-7 shadow-panel">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-lama-muted" aria-hidden />
            <h2 className="text-sm font-semibold text-lama-text">Persistencia propia</h2>
          </div>
          <p className="mt-4 text-sm text-lama-muted">
            No requerida en esta base. Supabase/PostgreSQL puede agregarse si el Control Plane
            necesita guardar configuracion propia.
          </p>
        </article>
        <article className="rounded-[24px] border border-lama-border bg-lama-surface/95 p-7 shadow-panel">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-lama-muted" aria-hidden />
            <h2 className="text-sm font-semibold text-lama-text">Gemini AI</h2>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-lama-muted">
              GEMINI_API_KEY {appConfig.geminiApiKey ? "configurada" : "no configurada"}.
            </p>
            <StatusBadge status={appConfig.geminiApiKey ? "active" : "pending"} />
          </div>
          <p className="mt-3 text-xs font-semibold text-lama-muted">Modelo: {appConfig.geminiModel}</p>
        </article>
      </section>
    </div>
  );
}
