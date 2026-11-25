/**
 * Columnas finales del cuerpo del reporte (sección 04). Función pura: la usa
 * el servidor para armar el SQL y el formulario de la sección 03 para el
 * resumen ("X columnas").
 *
 * Cada campo seleccionado se muestra tal cual, salvo las llaves foráneas:
 * esas se sustituyen, en su misma posición, por las columnas elegidas de la
 * tabla a la que hacen referencia (id_tipo -> nombre_tipo).
 */
import type { ColumnInfo, ForeignKeyInfo, ReportColumn } from "@/types/reporter";

export function buildReportColumns(
  fields: string[],
  relations: Record<string, string[]>,
  columns: ColumnInfo[],
  foreignKeys: ForeignKeyInfo[],
): ReportColumn[] {
  const fkByColumn = new Map(foreignKeys.map((fk) => [fk.column, fk]));

  const result: ReportColumn[] = columns
    .filter((c) => fields.includes(c.name))
    .flatMap((c): ReportColumn[] => {
      const fk = fkByColumn.get(c.name);
      if (!fk) return [{ key: c.name, label: c.name, type: c.type, source: "own" }];

      const chosen = relations[c.name]?.length ? relations[c.name] : fk.defaultColumns;
      return fk.refColumns
        .filter((rc) => chosen.includes(rc.name))
        .map((rc) => ({
          key: `${c.name}__${rc.name}`,
          label: rc.name,
          type: rc.type,
          source: "fk",
          fk: c.name,
          refColumn: rc.name,
        }));
    });

  // Si un encabezado se repite, las columnas foráneas llevan el nombre de su tabla.
  const count = new Map<string, number>();
  for (const col of result) count.set(col.label, (count.get(col.label) ?? 0) + 1);
  return result.map((col) => {
    if (col.source !== "fk" || (count.get(col.label) ?? 0) < 2) return col;
    const fk = fkByColumn.get(col.fk!);
    return { ...col, label: `${fk?.refTable}.${col.refColumn}` };
  });
}

/** Columnas por defecto de cada llave foránea: { id_tipo: ["nombre_tipo"], ... }. */
export function defaultRelations(foreignKeys: ForeignKeyInfo[]): Record<string, string[]> {
  return Object.fromEntries(foreignKeys.map((fk) => [fk.column, fk.defaultColumns]));
}
