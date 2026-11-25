import type { ReporterQuery } from "@/types/reporter";

/** Datos para acortar la URL omitiendo lo que coincide con los valores por defecto. */
export interface HrefDefaults {
  /** Número de columnas de la tabla: si están todas, se omite `campos`. */
  totalColumns?: number;
  /** Columnas por defecto de cada llave foránea: si coinciden, se omite su `rel`. */
  relations?: Record<string, string[]>;
}

/**
 * Construye la URL de /reporter a partir de la consulta actual y algunos
 * cambios. Todo el estado de la vista vive en la URL, así que cambiar de
 * tabla o de página es solo un <Link>:
 *   ?tabla=&campos=…&rel=llave.columna…&fc=&fo=&fv=&fv2=…&orden=&dir=&page=
 *
 * @example reporterHref(q, { page: 2 }) -> "/reporter?tabla=equipo&orden=id_equipo&dir=asc&page=2"
 */
export function reporterHref(
  q: ReporterQuery,
  changes: Partial<ReporterQuery> = {},
  defaults: HrefDefaults = {},
): string {
  const next = { ...q, ...changes };
  const params = new URLSearchParams({ tabla: next.table });

  if (defaults.totalColumns === undefined || next.fields.length < defaults.totalColumns) {
    for (const field of next.fields) params.append("campos", field);
  }
  // Columnas de las tablas foráneas: rel=id_tipo.nombre_tipo
  for (const [fk, cols] of Object.entries(next.relations)) {
    const def = defaults.relations?.[fk];
    if (def && def.length === cols.length && def.every((c, i) => c === cols[i])) continue;
    for (const col of cols) params.append("rel", `${fk}.${col}`);
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
