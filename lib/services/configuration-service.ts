import "server-only";
import { appConfig, serviceApiKeyEnvNames, serviceUrlEnvNames } from "@/lib/config";
import type { ActionResult, ControlPlaneConfiguration } from "@/types/domain";

export async function getControlPlaneConfiguration(): Promise<ControlPlaneConfiguration[]> {
  return [
    {
      service: "Buyer App",
      envKeys: [...serviceUrlEnvNames.buyer],
      configured: Boolean(appConfig.services.buyer),
      baseUrl: appConfig.services.buyer,
      apiKeyEnv: serviceApiKeyEnvNames.buyer,
      apiKeyConfigured: Boolean(appConfig.apiKeys.buyer),
    },
    {
      service: "Seller App",
      envKeys: [...serviceUrlEnvNames.seller],
      configured: Boolean(appConfig.services.seller),
      baseUrl: appConfig.services.seller,
      apiKeyEnv: serviceApiKeyEnvNames.seller,
      apiKeyConfigured: Boolean(appConfig.apiKeys.seller),
    },
    {
      service: "Shipping App",
      envKeys: [...serviceUrlEnvNames.shipping],
      configured: Boolean(appConfig.services.shipping),
      baseUrl: appConfig.services.shipping,
      apiKeyEnv: serviceApiKeyEnvNames.shipping,
      apiKeyConfigured: Boolean(appConfig.apiKeys.shipping),
    },
    {
      service: "Payments App",
      envKeys: [...serviceUrlEnvNames.payments],
      configured: Boolean(appConfig.services.payments),
      baseUrl: appConfig.services.payments,
      apiKeyEnv: serviceApiKeyEnvNames.payments,
      apiKeyConfigured: Boolean(appConfig.apiKeys.payments),
    },
  ];
}

export async function updateGlobalConfiguration(): Promise<ActionResult> {
  // TODO: persistir en Supabase/PostgreSQL si el Control Plane necesita configuracion propia.
  return {
    success: false,
    error: {
      code: "CONFIG_PERSISTENCE_NOT_ENABLED",
      message: "La persistencia de configuracion global aun no esta habilitada.",
    },
  };
}
