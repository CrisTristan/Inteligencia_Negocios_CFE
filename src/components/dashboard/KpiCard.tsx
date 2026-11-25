/**
 * Tarjeta de indicador (KPI): etiqueta, cifra grande, detalle y, si se
 * indica, una barra de progreso 0–100.
 *
 * @example
 *   <KpiCard label="En funcionamiento" value={78} unit="%" detail="62 de 80 equipos" progress={78} />
 */
interface KpiCardProps {
  label: string;
  value: string | number;
  /** Unidad pequeña junto a la cifra ("%"). */
  unit?: string;
  detail?: string;
  /** "danger" pinta la cifra en rojo (fallas, pendientes). */
  tone?: "default" | "danger";
  /** Porcentaje para la barra de progreso (0–100). */
  progress?: number;
}

export function KpiCard({ label, value, unit, detail, tone = "default", progress }: KpiCardProps) {
  return (
    <article className="flex flex-col rounded-xl border border-line bg-surface p-4">
      <h3 className="text-xs font-medium text-slate-500">{label}</h3>
      <p
        className={`mt-2 text-3xl font-semibold tabular-nums ${
          tone === "danger" ? "text-red-600 dark:text-red-400" : "text-slate-900"
        }`}
      >
        {value}
        {unit && <span className="ml-0.5 text-base font-medium text-slate-500">{unit}</span>}
      </p>
      {detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
      {progress !== undefined && (
        <div
          role="progressbar"
          aria-label={label}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"
        >
          <div
            className="h-full rounded-full bg-[#2a78d6] dark:bg-[#3987e5]"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </article>
  );
}
