"use client";
/**
 * Sección 03 · Panel "Detalles tabla foránea".
 *
 * Se abre desde el botón de un campo de tipo "relación" (p. ej. id_tipo) y
 * muestra la tabla a la que hace referencia: descripción, número de
 * registros, sus columnas y una vista previa. Las casillas eligen qué
 * columnas de esa tabla sustituyen al ID en el cuerpo del reporte.
 */
import { ArrowRight, Check, X } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { formatNumber } from "@/lib/format";
import type { ForeignKeyInfo } from "@/types/reporter";

export const FK_PANEL_ID = "panel-tabla-foranea";

interface ForeignKeyPanelProps {
  fk: ForeignKeyInfo;
  /** Columnas elegidas de la tabla referenciada (nunca vacío). */
  selected: string[];
  /** ¿Está marcado el campo de la llave en "Campos"? */
  fieldSelected: boolean;
  onToggle: (column: string) => void;
  onToggleAll: () => void;
  onClose: () => void;
}

export function ForeignKeyPanel({
  fk,
  selected,
  fieldSelected,
  onToggle,
  onToggleAll,
  onClose,
}: ForeignKeyPanelProps) {
  const allSelected = selected.length === fk.refColumns.length;
  const visible = fk.refColumns.filter((c) => selected.includes(c.name));

  return (
    <Panel
      id={FK_PANEL_ID}
      title="Detalles tabla foránea"
      meta={`${selected.length} de ${fk.refColumns.length} campos`}
      aside={
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalles de la tabla foránea"
          className="grid size-6 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      }
    >
      <div className="space-y-3 p-3">
        {/* Qué tabla es y cuántos registros tiene */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
            {fk.column}
          </code>
          <ArrowRight className="size-3.5 text-slate-400" aria-hidden />
          <span className="font-semibold text-slate-900">{fk.refLabel}</span>
          <span className="text-slate-400">
            · {fk.refDescription} · {formatNumber(fk.total)} registros
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Elige qué columnas de <span className="font-mono">{fk.refTable}</span> se muestran en el
          reporte en lugar de <span className="font-mono">{fk.column}</span>.
          {!fieldSelected && " El campo no está seleccionado: al marcar una columna se incluye."}
        </p>

        {/* Columnas de la tabla referenciada */}
        <div>
          <div className="mb-1 flex items-center justify-between">
            <button
              type="button"
              onClick={onToggleAll}
              className="text-[10px] font-bold uppercase text-primary hover:underline dark:text-sky-300"
            >
              {allSelected ? "Restablecer" : "Seleccionar todo"}
            </button>
            <span className="text-[10px] text-slate-400">Mínimo un campo</span>
          </div>
          <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {fk.refColumns.map((column) => {
              const checked = selected.includes(column.name);
              const locked = checked && selected.length === 1; // no se puede quitar la última
              return (
                <li key={column.name}>
                  <label
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 transition-colors ${
                      locked ? "cursor-not-allowed" : "cursor-pointer"
                    } ${checked ? "bg-slate-50" : "hover:bg-slate-50"}`}
                    title={locked ? "Debe quedar al menos un campo" : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={locked}
                      onChange={() => onToggle(column.name)}
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
                    <span className={`flex-1 truncate text-xs font-medium ${checked ? "text-slate-800" : "text-slate-500"}`}>
                      {column.name}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">{column.type}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Vista previa: primeras filas con las columnas elegidas */}
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase text-slate-500">
            Vista previa · {fk.sample.length} de {formatNumber(fk.total)}
          </p>
          <div className="overflow-x-auto rounded-md border border-line">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                <tr>
                  {visible.map((c) => (
                    <th key={c.name} className="px-2.5 py-1.5 font-semibold whitespace-nowrap">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fk.sample.map((row, i) => (
                  <tr key={i} className="border-t border-line">
                    {visible.map((c) => (
                      <td key={c.name} className="max-w-48 truncate px-2.5 py-1.5 whitespace-nowrap text-slate-700">
                        {row[c.name]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Panel>
  );
}
