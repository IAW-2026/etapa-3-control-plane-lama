import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { getOperationalSnapshot } from "@/lib/services/anomaly-service";
import { askGemini } from "@/lib/services/gemini-service";

export const runtime = "nodejs";

const requestsByUser = new Map<string, number[]>();

function isRateLimited(userId: string) {
  const now = Date.now();
  const recent = (requestsByUser.get(userId) ?? []).filter((timestamp) => now - timestamp < 60_000);
  if (recent.length >= 10) return true;
  requestsByUser.set(userId, [...recent, now]);
  return false;
}

export async function POST(request: Request) {
  const { userId } = await requireSuperAdmin();

  if (isRateLimited(userId)) {
    return NextResponse.json(
      { error: "Alcanzaste el limite de 10 consultas por minuto. Intenta nuevamente en unos segundos." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no contiene JSON valido." }, { status: 400 });
  }

  const question =
    body && typeof body === "object" && "question" in body
      ? (body as { question?: unknown }).question
      : null;

  if (typeof question !== "string" || question.trim().length < 3 || question.length > 500) {
    return NextResponse.json(
      { error: "La consulta debe tener entre 3 y 500 caracteres." },
      { status: 400 },
    );
  }

  try {
    const snapshot = await getOperationalSnapshot();
    const answer = await askGemini(question.trim(), snapshot);
    return NextResponse.json(answer);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo consultar el copiloto." },
      { status: 503 },
    );
  }
}
