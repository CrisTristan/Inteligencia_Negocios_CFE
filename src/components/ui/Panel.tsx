import type { ReactNode } from "react";

/**
 * Contenedor con borde y encabezado en mayúsculas de cada columna de la
 * sección 03 (tablas, campos, filtros). Sirve en servidor y en cliente.
 */
export function Panel({
  title,
  meta,
  aside,
  id,
  children,
}: {
  title: string;
  meta: string;
  /** Contenido extra a la derecha del encabezado (p. ej. botón de cerrar). */
  aside?: ReactNode;
  id?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className="self-start rounded-lg border border-line">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-3">
        <h3 className="text-[11px] font-bold uppercase text-slate-800">{title}</h3>
        <span className="flex items-center gap-2">
          <span className="text-right text-[10px] text-slate-400">{meta}</span>
          {aside}
        </span>
      </div>
      {children}
    </div>
  );
}
