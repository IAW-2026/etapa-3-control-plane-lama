"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-lama-border bg-lama-surface p-7 text-lama-text shadow-panel">
      <h2 className="text-xl font-black">No se pudo cargar esta vista</h2>
      <p className="mt-2 text-sm">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-[14px] bg-lama-primary px-5 py-3 text-sm font-bold text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
