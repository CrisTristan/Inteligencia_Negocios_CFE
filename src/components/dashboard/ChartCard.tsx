import type { ReactNode } from "react";

/** Tabla con los mismos datos de la gráfica (accesible y sin depender del color). */
export interface ChartTable {
  headers: string[];
  rows: (string | number)[][];
}

interface ChartCardProps {
  title: string;
  /** Texto pequeño a la derecha del título ("80 equipos"). */
  meta?: string;
  children: ReactNode;
  /** Nota bajo la gráfica (p. ej. la explicación de colores). */
  footer?: ReactNode;
  /** Si se indica, se muestra un desplegable "Ver tabla de datos". */
  table?: ChartTable;
  className?: string;
}

/**
 * Marco común de cada gráfica del tablero: título, meta, la gráfica, una
 * nota opcional y la tabla de datos desplegable.
 */
export function ChartCard({ title, meta, children, footer, table, className = "" }: ChartCardProps) {
  return (
    <section className={`flex flex-col rounded-xl border border-line bg-surface p-5 ${className}`}>
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {meta && <span className="text-xs text-slate-500">{meta}</span>}
      </header>

      <div className="flex-1">{children}</div>

      {footer && <div className="mt-4 text-xs text-slate-500">{footer}</div>}

      {table && (
        <details className="mt-4 text-xs">
          <summary className="cursor-pointer font-semibold text-primary select-none dark:text-sky-300">
            Ver tabla de datos
          </summary>
          <div className="mt-2 max-h-64 overflow-auto rounded-md border border-line">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase text-slate-500">
                <tr>
                  {table.headers.map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-t border-line">
                    {row.map((cell, j) => (
                      <td key={j} className={`px-3 py-1.5 text-slate-700 ${j > 0 ? "tabular-nums" : ""}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}
