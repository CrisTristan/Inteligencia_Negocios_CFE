"use client";
/**
 * Límite de error de /reporter. Si una consulta falla (por ejemplo, el
 * contenedor de PostgreSQL está apagado) se muestra este aviso en lugar de
 * una pantalla rota. Debe ser Client Component para poder reintentar.
 */
export default function ReporterError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="text-xl font-bold text-slate-900">No se pudo cargar el reporte</h1>
      <p className="mt-2 text-sm text-slate-600">
        Verifica que la base de datos esté en ejecución con{" "}
        <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs">docker compose up -d</code>{" "}
        y que <code className="font-mono text-xs">DATABASE_URL</code> esté definida en{" "}
        <code className="font-mono text-xs">.env.local</code>.
      </p>
      {error.digest && <p className="mt-2 font-mono text-xs text-slate-400">{error.digest}</p>}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white"
      >
        Reintentar
      </button>
    </main>
  );
}
