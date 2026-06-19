import { CopilotChat } from "@/components/CopilotChat";
import { PageHeader } from "@/components/PageHeader";
import { appConfig } from "@/lib/config";

export default function CopilotPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Copiloto operativo"
        description="Consulta el estado del marketplace en lenguaje natural con respuestas basadas en datos consolidados."
      />
      <CopilotChat configured={Boolean(appConfig.geminiApiKey)} />
    </div>
  );
}
