import { BadgeCheck, Clock, Rows3, Server, type LucideIcon } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { Kpis } from "@/types/reporter";

interface TotalsSectionProps {
  /** Registros de la tabla consultada. */
  totalRegistros: number;
  kpis: Kpis;
}

/**
 * Sección 05 · Banda oscura con el consolidado del reporte.
 * En lugar de sumas de dinero (ejemplo de tienda) muestra los indicadores
 * clave del departamento; el último (cumplimiento) va destacado.
 */
export function TotalsSection({ totalRegistros, kpis }: TotalsSectionProps) {
  const items: { label: string; value: string; detail?: string; icon: LucideIcon }[] = [
    { label: "Registros", value: formatNumber(totalRegistros), icon: Rows3 },
    {
      label: "Equipos",
      value: formatNumber(kpis.equipos),
      detail: `${kpis.equiposConFalla} con falla o fuera de servicio`,
      icon: Server,
    },
    {
      label: "Mant. pendientes",
      value: formatNumber(kpis.mantenimientosPendientes),
      icon: Clock,
    },
  ];

  return (
    <section className="grid overflow-hidden rounded-xl lg:grid-cols-[210px_1fr]">
      {/* Identificador de la sección */}
      <div className="bg-primary p-5 text-white">
        <h2 className="flex items-baseline gap-2 text-sm font-bold">
          <span className="font-mono text-[11px] text-white/70">05</span> Sumas totales
        </h2>
        <p className="mt-2 text-xs text-white/75">Consolidado de indicadores del departamento</p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 bg-navy sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Indicator key={item.label} {...item} />
        ))}
        <Indicator
          label="Cumplimiento"
          value={`${kpis.cumplimiento.toFixed(1)}%`}
          detail="Mant. realizados vs. programados"
          icon={BadgeCheck}
          highlight
        />
      </div>
    </section>
  );
}

/** Un indicador: ícono en caja translúcida, etiqueta y valor en monoespaciado. */
function Indicator({
  label,
  value,
  detail,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 border-white/10 px-6 py-5 lg:border-l lg:first:border-l-0">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-md ${
          highlight ? "bg-primary text-white" : "bg-white/10 text-white/80"
        }`}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase text-white/60">{label}</p>
        <p
          className={`font-mono font-bold ${
            highlight ? "text-xl text-sky-300" : "text-base text-white"
          }`}
        >
          {value}
        </p>
        {detail && <p className="text-[10px] text-white/60">{detail}</p>}
      </div>
    </div>
  );
}
