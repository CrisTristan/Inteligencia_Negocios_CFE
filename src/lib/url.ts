import type { ReporterQuery } from "@/types/reporter";

/**
 * Construye la URL de /reporter a partir de la consulta actual y algunos
 * cambios. Todo el estado de la vista vive en la URL, así que cambiar de
 * tabla o de página es solo un <Link>:
 *   ?tabla=&campos=…&fc=&fo=&fv=&fv2=…&orden=&dir=&page=
 *
 * @param totalColumns número de columnas de la tabla; si están todas
 *   seleccionadas se omite `campos` para que la URL quede corta.
 *
 * @example reporterHref(q, { page: 2 }) -> "/reporter?tabla=equipo&orden=id_equipo&dir=asc&page=2"
 */
export function reporterHref(
  q: ReporterQuery,
  changes: Partial<ReporterQuery> = {},
  totalColumns?: number,
): string {
  const next = { ...q, ...changes };
  const params = new URLSearchParams({ tabla: next.table });

  if (totalColumns === undefined || next.fields.length < totalColumns) {
    for (const field of next.fields) params.append("campos", field);
  }
  // Filtros como arreglos paralelos, emparejados por posición.
  for (const f of next.filters) {
    params.append("fc", f.field);
    params.append("fo", f.op);
    params.append("fv", f.value);
    params.append("fv2", f.value2);
  }

  params.set("orden", next.orderBy);
  params.set("dir", next.dir);
  params.set("page", String(next.page));
  return `/reporter?${params.toString()}`;
}
