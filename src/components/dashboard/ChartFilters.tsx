"use client";
/**
 * Encabezado del tablero con los filtros (Zona, Tipo de equipo, Año) y el
 * botón "Limpiar filtros". Envuelve al contenido para atenuarlo mientras
 * el servidor recalcula.
 *
 * Los filtros viven en la URL (?zona=&tipo=&anio=). Al cambiar un selector
 * se navega del lado del cliente; useOptimistic muestra el valor elegido
 * de inmediato, aunque los datos nuevos tarden un momento.
 */
import { useOptimistic, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";
import type { ChartFilterOptions, ChartFilters as Filters } from "@/types/charts";

interface ChartFiltersProps {
  /** Título y subtítulo de la página (a la izquierda de los filtros). */
  heading: ReactNode;
  options: ChartFilterOptions;
  filters: Filters;
  children: ReactNode;
}

export function ChartFilters({ heading, options, filters, children }: ChartFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useOptimistic(filters);

  const hasFilters = current.zona !== null || current.tipo !== null || current.anio !== null;
  const allYears =
    options.anios.length > 1
      ? `${options.anios[0]} – ${options.anios[options.anios.length - 1]}`
      : "Todos";

  function apply(next: Filters) {
    const params = new URLSearchParams();
    if (next.zona !== null) params.set("zona", next.zona);
    if (next.tipo !== null) params.set("tipo", String(next.tipo));
    if (next.anio !== null) params.set("anio", String(next.anio));
    const qs = params.toString();
    startTransition(() => {
      setCurrent(next);
      router.push(qs ? `/charts?${qs}` : "/charts", { scroll: false });
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        {heading}
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Zona"
            value={current.zona ?? ""}
            onChange={(v) => apply({ ...current, zona: v || null })}
            options={[{ value: "", label: "Todas" }, ...options.zonas.map((z) => ({ value: z, label: z }))]}
          />
          <FilterSelect
            label="Tipo de equipo"
            value={current.tipo === null ? "" : String(current.tipo)}
            onChange={(v) => apply({ ...current, tipo: v ? Number(v) : null })}
            options={[
              { value: "", label: "Todos" },
              ...options.tipos.map((t) => ({ value: String(t.id), label: t.nombre })),
            ]}
          />
          <FilterSelect
            label="Año (mantenimientos)"
            value={current.anio === null ? "" : String(current.anio)}
            onChange={(v) => apply({ ...current, anio: v ? Number(v) : null })}
            options={[
              { value: "", label: allYears },
              ...options.anios.map((a) => ({ value: String(a), label: String(a) })),
            ]}
          />
          <button
            type="button"
            onClick={() => apply({ zona: null, tipo: null, anio: null })}
            disabled={!hasFilters}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-surface px-3.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
            Limpiar filtros
          </button>
        </div>
      </div>

      <div
        aria-busy={isPending}
        className={`space-y-4 transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}
      >
        {children}
      </div>
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-slate-500">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 min-w-36 appearance-none rounded-md border border-slate-300 bg-surface pr-8 pl-3 text-xs text-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-2.5 right-2.5 size-4 text-slate-500" aria-hidden />
      </span>
    </label>
  );
}
