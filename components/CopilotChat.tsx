"use client";

import Link from "next/link";
import { Bot, ExternalLink, Send, Sparkles, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";
import type { CopilotAnswer } from "@/types/domain";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  references?: CopilotAnswer["references"];
  error?: boolean;
};

const suggestions = [
  "¿Que ordenes necesitan atencion urgente?",
  "Resume las anomalías de pagos y envios",
  "¿Hay publicaciones de vendedores inactivos?",
  "Dame un panorama operativo general",
];

export function CopilotChat({ configured }: { configured: boolean }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(value: string) {
    const trimmed = value.trim();
    if (trimmed.length < 3 || loading) return;

    const userMessage: Message = { id: Date.now(), role: "user", text: trimmed };
    setMessages((current) => [...current, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const payload = await response.json() as CopilotAnswer & { error?: string };
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        role: "assistant",
        text: response.ok ? payload.answer : (payload.error ?? "No se pudo obtener una respuesta."),
        references: response.ok ? payload.references : [],
        error: !response.ok,
      }]);
    } catch {
      setMessages((current) => [...current, {
        id: Date.now() + 1,
        role: "assistant",
        text: "No se pudo conectar con el copiloto.",
        error: true,
      }]);
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(question);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="flex min-h-[560px] flex-col overflow-hidden rounded-[26px] border border-lama-border bg-lama-surface shadow-panel">
        <div className="flex items-center gap-3 border-b border-lama-border bg-white/60 px-6 py-5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lama-primary/15 text-lama-text">
            <Bot className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-black">Copiloto LAMA</h2>
            <p className="text-xs font-semibold text-lama-muted">Gemini · Solo lectura · Datos operativos actuales</p>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6" aria-live="polite">
          {!messages.length ? (
            <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
              <Sparkles className="h-9 w-9 text-lama-primary" aria-hidden />
              <h3 className="mt-5 text-xl font-black">¿Que queres investigar?</h3>
              <p className="mt-2 text-sm leading-6 text-lama-muted">
                Puedo analizar hasta 100 registros recientes por fuente, explicar alertas y llevarte al detalle relevante.
              </p>
            </div>
          ) : null}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" ? (
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lama-primary/15">
                  <Bot className="h-4 w-4" aria-hidden />
                </span>
              ) : null}
              <div className={`max-w-2xl rounded-[20px] px-5 py-4 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-lama-primary text-white"
                  : message.error
                    ? "border border-red-200 bg-red-50 text-red-900"
                    : "border border-lama-border bg-white text-lama-text"
              }`}>
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.references?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-lama-border/70 pt-3">
                    {message.references.map((reference) => (
                      <Link
                        key={`${message.id}-${reference.href}`}
                        href={reference.href}
                        className="inline-flex items-center gap-1 rounded-xl border border-lama-border bg-lama-surface px-3 py-1.5 text-xs font-bold hover:border-lama-primary"
                      >
                        {reference.label}<ExternalLink className="h-3 w-3" aria-hidden />
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
              {message.role === "user" ? (
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lama-primary text-white">
                  <UserRound className="h-4 w-4" aria-hidden />
                </span>
              ) : null}
            </div>
          ))}
          {loading ? (
            <div className="flex items-center gap-3 text-sm font-semibold text-lama-muted">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-lama-primary" />
              Analizando el ecosistema LAMA…
            </div>
          ) : null}
        </div>

        <form onSubmit={onSubmit} className="border-t border-lama-border bg-white/50 p-5">
          <div className="flex gap-3">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value.slice(0, 500))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit(question);
                }
              }}
              rows={2}
              disabled={!configured || loading}
              placeholder={configured ? "Pregunta por ordenes, pagos, envios o alertas…" : "Configura GEMINI_API_KEY para habilitar el copiloto"}
              className="min-h-[58px] flex-1 resize-none rounded-[18px] border border-lama-border bg-white px-5 py-4 text-sm outline-none transition focus:border-lama-primary disabled:cursor-not-allowed disabled:bg-stone-100"
            />
            <button
              type="submit"
              disabled={!configured || loading || question.trim().length < 3}
              className="flex h-[58px] w-[58px] items-center justify-center self-end rounded-[18px] bg-lama-primary text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Enviar consulta"
            >
              <Send className="h-5 w-5" aria-hidden />
            </button>
          </div>
          <p className="mt-2 text-right text-[11px] font-semibold text-lama-muted">{question.length}/500</p>
        </form>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[24px] border border-lama-border bg-lama-surface p-5 shadow-soft">
          <h2 className="text-sm font-black">Consultas sugeridas</h2>
          <div className="mt-4 space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={!configured || loading}
                onClick={() => void submit(suggestion)}
                className="w-full rounded-2xl border border-lama-border bg-white px-4 py-3 text-left text-xs font-bold leading-5 transition hover:border-lama-primary disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          El copiloto puede equivocarse. Verifica la ficha enlazada antes de tomar una decision operativa.
        </div>
      </aside>
    </div>
  );
}
