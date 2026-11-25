"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownAZ,
  ArrowUpZA,
  Check,
  ChevronDown,
  Loader2,
  Minus,
  Play,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import {
  inputTypeFor,
  isCompleteFilter,
  opNeedsTwoValues,
  opNeedsValue,
  operatorsFor,
} from "@/lib/filters";
import { reporterHref } from "@/lib/url";
import type { ColumnInfo, FilterOp, ReporterFilter, ReporterQuery, SortDir } from "@/types/reporter";

interface QueryFormProps {
  /** Todas las columnas de la tabla elegida. */
  columns: ColumnInfo[];
  /** Consulta aplicada (la que hoy muestra la vista previa). */
  query: ReporterQuery;
  /** Nombre legible de la tabla, para el resumen. */
  tableLabel: string;
  /** Panel "Tablas disponibles" (Server Component con <Link>s). */
  children: ReactNode;
}

/** Fila de filtro en edición; `id` solo sirve como key de React. */
interface FilterRow extends ReporterFilter {
  id: number;
}

/**
 * Sección 03 · Parte interactiva del constructor de consultas.
 *
 * El usuario marca campos y arma filtros libremente; nada se aplica hasta
 * pulsar "Generar reporte" (o A-Z / Z-A). Entonces se construye la URL con
 * reporterHref() y se navega del lado del cliente: el servidor vuelve a
 * consultar PostgreSQL y las secciones 04 y 05 se actualizan.
 *
 * Sin JavaScript, el <form method="get"> sigue funcionando: los nombres de
 * los controles (campos, fc, fo, fv, fv2, orden, dir) son los mismos que lee
 * resolveQuery() en el servidor.
 */
export function QueryForm({ columns, query, tableLabel, children }: QueryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [fields, setFields] = useState<string[]>(query.fields);
  const [filters, setFilters] = useState<FilterRow[]>(() =>
    query.filters.map((f, i) => ({ ...f, id: i })),
  );
  const [orderBy, setOrderBy] = useState(query.orderBy);

  const typeOf = (field: string) => columns.find((c) => c.name === field)?.type ?? "texto";
  const isComplete = (f: ReporterFilter) => isCompleteFilter(f, typeOf(f.field));

  const completeFilters: ReporterFilter[] = filters
    .filter(isComplete)
    .map(({ field, op, value, value2 }) => ({ field, op, value, value2 }));
  const incompleteCount = filters.length - completeFilters.length;
  const allSelected = fields.length === columns.length;

  // ¿Hay cambios respecto a lo que muestra la vista previa?
  const dirty =
    JSON.stringify([fields, completeFilters, orderBy]) !==
    JSON.stringify([query.fields, query.filters, query.orderBy]);

  /* ---------------- Campos ---------------- */

  function toggleField(name: string) {
    setFields((prev) => {
      const next = prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name];
      // Se conserva el orden original de la tabla.
      return columns.map((c) => c.name).filter((c) => next.includes(c));
    });
  }

  function toggleAll() {
    setFields(allSelected ? [] : columns.map((c) => c.name));
  }

  /* ---------------- Filtros ---------------- */

  function addFilter() {
    const column = columns[0];
    setFilters((prev) => [
      ...prev,
      {
        id: prev.reduce((max, f) => Math.max(max, f.id), -1) + 1,
        field: column.name,
        op: operatorsFor(column.type)[0].op,
        value: "",
        value2: "",
      },
    ]);
  }

  function updateFilter(id: number, changes: Partial<ReporterFilter>) {
    setFilters((prev) =>
      prev.map((f) => {
        if (f.id !== id) return f;
        const next = { ...f, ...changes };
        // Al cambiar de campo, la condición y el valor dejan de tener sentido.
        if (changes.field !== undefined && changes.field !== f.field) {
          next.op = operatorsFor(typeOf(changes.field))[0].op;
          next.value = "";
          next.value2 = "";
        }
        if (!opNeedsValue(next.op)) next.value = "";
        if (!opNeedsTwoValues(next.op)) next.value2 = "";
        return next;
      }),
    );
  }

  const removeFilter = (id: number) => setFilters((prev) => prev.filter((f) => f.id !== id));
  const removeLastFilter = () => setFilters((prev) => prev.slice(0, -1));
  const clearFilters = () => setFilters([]);

  /* ---------------- Aplicar ---------------- */

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fields.length === 0) return;

    // El botón pulsado (A-Z, Z-A o Generar reporte) aporta la dirección.
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const dir: SortDir = submitter?.value === "desc" ? "desc" : submitter?.value === "asc" ? "asc" : query.dir;

    const href = reporterHref(
      query,
      { fields, filters: completeFilters, orderBy, dir, page: 1 },
      columns.length,
    );
    startTransition(() => router.push(href, { scroll: false }));
  }

  return (
    <form method="get" action="/reporter" onSubmit={handleSubmit} className="p-5">
      {/* La tabla viaja oculta para conservarla al enviar el formulario. */}
      <input type="hidden" name="tabla" value={query.table} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_2.8fr_5.2fr]">
        {children}

        {/* ---------- Campos de la tabla elegida ---------- */}
        <Panel
          title={`Campos de ${tableLabel.toLowerCase()}`}
          meta={`${fields.length} de ${columns.length} seleccionados`}
        >
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <button
              type="button"
              onClick={toggleAll}
              className="text-[10px] font-bold uppercase text-primary hover:underline dark:text-sky-300"
            >
              {allSelected ? "Quitar todo" : "Seleccionar todo"}
            </button>
            <span className="text-[10px] text-slate-400">Selección múltiple</span>
          </div>
          <ul className="space-y-1 p-2">
            {columns.map((column) => {
              const checked = fields.includes(column.name);
              return (
                <li key={column.name}>
                  <label
                    className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${
                      checked ? "bg-slate-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="campos"
                      value={column.name}
                      checked={checked}
                      onChange={() => toggleField(column.name)}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className={`grid size-4 shrink-0 place-items-center rounded-sm border text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 ${
                        checked ? "border-primary bg-primary" : "border-slate-300 bg-surface"
                      }`}
                    >
                      {checked && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span
                      className={`flex-1 truncate text-sm font-medium ${
                        checked ? "text-slate-800" : "text-slate-500"
                      }`}
                    >
                      {column.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{column.type}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          {fields.length === 0 && (
            <p role="alert" className="border-t border-line px-3 py-2 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Selecciona al menos un campo para generar el reporte.
            </p>
          )}
        </Panel>

        {/* ---------- Filtros y ordenamiento ---------- */}
        <Panel
          title="Filtros y ordenamiento"
          meta={
            `${completeFilters.length} ${completeFilters.length === 1 ? "filtro activo" : "filtros activos"}` +
            (incompleteCount > 0 ? ` · ${incompleteCount} incompleto${incompleteCount === 1 ? "" : "s"}` : "")
          }
        >
          <div className="space-y-4 p-3">
            {filters.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 px-3 py-3 text-xs text-slate-500">
                Sin filtros: se incluyen todos los registros de la tabla.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[1fr_1fr_1.2fr_2.25rem] gap-2 text-[10px] font-semibold uppercase text-slate-500">
                  <span>Campo</span>
                  <span>Condición</span>
                  <span>Valor</span>
                  <span className="sr-only">Quitar</span>
                </div>
                {filters.map((filter, index) => (
                  <FilterRowEditor
                    key={filter.id}
                    index={index}
                    filter={filter}
                    columns={columns}
                    complete={isComplete(filter)}
                    onChange={(changes) => updateFilter(filter.id, changes)}
                    onRemove={() => removeFilter(filter.id)}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="soft" onClick={addFilter}>
                <Plus className="size-3.5" aria-hidden /> Agregar filtro
              </Button>
              <Button onClick={clearFilters} disabled={filters.length === 0}>
                <RotateCcw className="size-3.5" aria-hidden /> Limpiar
              </Button>
              <Button onClick={removeLastFilter} disabled={filters.length === 0}>
                <Minus className="size-3.5" aria-hidden /> Quitar filtro
              </Button>
            </div>

            {/* ---------- Ordenamiento ---------- */}
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-600">Ordenar por</p>
              <label htmlFor="orden" className="mt-2 block text-[10px] font-semibold uppercase text-slate-500">
                Campo
              </label>
              <div className="mt-1 flex gap-2">
                <div className="relative flex-1">
                  <select
                    id="orden"
                    name="orden"
                    value={orderBy}
                    onChange={(e) => setOrderBy(e.target.value)}
                    className="h-9 w-full appearance-none rounded-md border border-slate-300 bg-surface px-3 text-sm text-slate-800"
                  >
                    {columns.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-2.5 right-3 size-4 text-slate-500" aria-hidden />
                </div>
                {/* Botones de envío: aplican la consulta con la dirección elegida. */}
                <Button
                  type="submit"
                  name="dir"
                  value="asc"
                  disabled={fields.length === 0 || isPending}
                  variant={query.dir === "asc" ? "primary" : "outline"}
                >
                  <ArrowDownAZ className="size-4" aria-hidden /> A-Z
                </Button>
                <Button
                  type="submit"
                  name="dir"
                  value="desc"
                  disabled={fields.length === 0 || isPending}
                  variant={query.dir === "desc" ? "primary" : "outline"}
                >
                  <ArrowUpZA className="size-4" aria-hidden /> Z-A
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* ---------- Resumen y generación ---------- */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-3 text-xs text-slate-500" aria-live="polite">
          {fields.length === 0 ? (
            <Badge tone="warning">Consulta incompleta</Badge>
          ) : dirty ? (
            <Badge tone="warning">Cambios sin aplicar</Badge>
          ) : (
            <Badge tone="success">Consulta válida</Badge>
          )}
          <span>
            {tableLabel} · {fields.length} {fields.length === 1 ? "campo" : "campos"} · {completeFilters.length}{" "}
            {completeFilters.length === 1 ? "filtro" : "filtros"} · {orderBy} {query.dir === "asc" ? "A-Z" : "Z-A"}
          </span>
        </p>
        {/* Conserva la dirección actual y aplica campos, filtros y orden. */}
        <Button
          type="submit"
          name="dir"
          value={query.dir}
          variant="primary"
          disabled={fields.length === 0 || isPending}
          className="px-4"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <Play className="size-3.5" aria-hidden />
          )}
          {isPending ? "Generando…" : "Generar reporte"}
        </Button>
      </div>
    </form>
  );
}

const CONTROL =
  "h-9 w-full min-w-0 rounded-md border bg-surface px-2.5 text-xs text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

/** Una fila de filtro: campo, condición, valor(es) y botón para quitarla. */
function FilterRowEditor({
  index,
  filter,
  columns,
  complete,
  onChange,
  onRemove,
}: {
  index: number;
  filter: FilterRow;
  columns: ColumnInfo[];
  complete: boolean;
  onChange: (changes: Partial<ReporterFilter>) => void;
  onRemove: () => void;
}) {
  const type = columns.find((c) => c.name === filter.field)?.type ?? "texto";
  const needsValue = opNeedsValue(filter.op);
  const needsTwo = opNeedsTwoValues(filter.op);
  const inputType = inputTypeFor(type);
  const n = index + 1;
  // Borde ámbar en los valores mientras el filtro esté incompleto.
  const valueBorder = complete ? "border-slate-300" : "border-amber-400";

  return (
    <div className="grid grid-cols-[1fr_1fr_1.2fr_2.25rem] items-start gap-2">
      <div className="relative">
        <select
          name="fc"
          aria-label={`Campo del filtro ${n}`}
          value={filter.field}
          onChange={(e) => onChange({ field: e.target.value })}
          className={`${CONTROL} appearance-none border-slate-300 pr-7`}
        >
          {columns.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-2.5 right-2 size-3.5 text-slate-500" aria-hidden />
      </div>

      <div className="relative">
        <select
          name="fo"
          aria-label={`Condición del filtro ${n}`}
          value={filter.op}
          onChange={(e) => onChange({ op: e.target.value as FilterOp })}
          className={`${CONTROL} appearance-none border-slate-300 pr-7`}
        >
          {operatorsFor(type).map((o) => (
            <option key={o.op} value={o.op}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-2.5 right-2 size-3.5 text-slate-500" aria-hidden />
      </div>

      {/* fv y fv2 siempre se envían para que los arreglos queden alineados. */}
      <div className="flex min-w-0 flex-col gap-1">
        {needsValue ? (
          <input
            type={inputType}
            name="fv"
            aria-label={needsTwo ? `Valor inicial del filtro ${n}` : `Valor del filtro ${n}`}
            placeholder={needsTwo ? "Desde" : inputType === "number" ? "Número" : "Texto"}
            step={inputType === "number" ? 1 : undefined}
            value={filter.value}
            onChange={(e) => onChange({ value: e.target.value })}
            className={`${CONTROL} ${valueBorder}`}
          />
        ) : (
          <>
            <input type="hidden" name="fv" value="" />
            <span className="flex h-9 items-center px-1 text-xs text-slate-400">Sin valor</span>
          </>
        )}
        {needsTwo ? (
          <input
            type={inputType}
            name="fv2"
            aria-label={`Valor final del filtro ${n}`}
            placeholder="Hasta"
            step={inputType === "number" ? 1 : undefined}
            value={filter.value2}
            onChange={(e) => onChange({ value2: e.target.value })}
            className={`${CONTROL} ${valueBorder}`}
          />
        ) : (
          <input type="hidden" name="fv2" value="" />
        )}
      </div>

      <Button onClick={onRemove} aria-label={`Quitar filtro ${n}`} className="w-9 px-0">
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
