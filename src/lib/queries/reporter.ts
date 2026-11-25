/**
 * Consultas de LECTURA para la vista /reporter.
 *
 * No son server actions: son funciones normales que llaman los Server
 * Components al renderizar. Las escrituras (crear/actualizar/borrar) viven
 * en src/actions.
 *
 * Seguridad: los nombres de tabla y de columna NO se pueden enviar como
 * parámetros ($1) en SQL, así que se validan antes de interpolarlos:
 *   - la tabla debe estar en TABLE_CATALOG (lista blanca);
 *   - la columna de orden debe existir en esa tabla (information_schema).
 */
import "server-only";
import { query } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { isCompleteFilter, kindOf, opNeedsValue } from "@/lib/filters";
import {
  DEFAULT_TABLE,
  FECHA_CORTE,
  PAGE_SIZE,
  TABLE_CATALOG,
} from "@/config/reporter";
import type {
  ColumnInfo,
  FilterOp,
  Kpis,
  ReporterFilter,
  ReporterQuery,
  Row,
  RowsPage,
  TableInfo,
  TableName,
} from "@/types/reporter";

/** Nombres de las tablas permitidas, en el orden en que se muestran. */
const TABLE_NAMES = Object.keys(TABLE_CATALOG) as TableName[];

/** Traducción de los tipos de PostgreSQL a etiquetas legibles. */
const TYPE_LABELS: Record<string, string> = {
  integer: "entero",
  "character varying": "texto",
  text: "texto largo",
  date: "fecha",
};

/** Indica si un valor de la URL es una tabla de la lista blanca. */
export function isTableName(value: unknown): value is TableName {
  return typeof value === "string" && TABLE_NAMES.includes(value as TableName);
}

/**
 * Sección 03 · Tablas disponibles con su número de campos.
 * El número sale de information_schema, así refleja el esquema real.
 */
export async function getTables(): Promise<TableInfo[]> {
  const rows = await query<{ table_name: TableName; field_count: number }>(
    `SELECT table_name, COUNT(*)::int AS field_count
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ANY($1)
      GROUP BY table_name`,
    [TABLE_NAMES],
  );
  const counts = new Map(rows.map((r) => [r.table_name, r.field_count]));

  return TABLE_NAMES.map((name) => ({
    name,
    ...TABLE_CATALOG[name],
    fieldCount: counts.get(name) ?? 0,
  }));
}

/**
 * Sección 03 · Campos de una tabla con su tipo de dato.
 * Las columnas id_* que no son la primera (la PK) son llaves foráneas y se
 * etiquetan como "relación", igual que en el diseño.
 */
export async function getColumns(table: TableName): Promise<ColumnInfo[]> {
  const rows = await query<{ column_name: string; data_type: string }>(
    `SELECT column_name, data_type
       FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position`,
    [table],
  );

  return rows.map((r, index) => ({
    name: r.column_name,
    type:
      index > 0 && r.column_name.startsWith("id_")
        ? "relación"
        : (TYPE_LABELS[r.data_type] ?? r.data_type),
  }));
}

/**
 * Convierte los parámetros crudos de la URL en una consulta válida.
 * Cualquier valor desconocido se sustituye por un valor por defecto.
 */
export function resolveQuery(
  params: Record<string, string | string[] | undefined>,
  columns: ColumnInfo[],
  table: TableName,
): ReporterQuery {
  // Si un parámetro viene repetido (?a=1&a=2) se toma el primero.
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

  const orden = first(params.orden);
  const page = Number.parseInt(first(params.page) ?? "1", 10);

  // Campos: solo los que existen, en el orden de la tabla; vacío = todos.
  const requested = new Set(toArray(params.campos));
  const fields = columns.filter((c) => requested.has(c.name)).map((c) => c.name);

  return {
    table,
    fields: fields.length > 0 ? fields : columns.map((c) => c.name),
    filters: resolveFilters(params, columns),
    orderBy: columns.some((c) => c.name === orden) ? orden! : columns[0].name,
    dir: first(params.dir) === "desc" ? "desc" : "asc",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Normaliza un parámetro de la URL (ausente, simple o repetido) a arreglo. */
function toArray(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

/** Máximo de filtros que se aceptan desde la URL. */
const MAX_FILTERS = 10;

/**
 * Filtros desde los arreglos paralelos ?fc=&fo=&fv=&fv2= (emparejados por
 * posición). Se descartan los que tengan un campo inexistente, un operador
 * no permitido para el tipo del campo o un valor inválido.
 */
function resolveFilters(
  params: Record<string, string | string[] | undefined>,
  columns: ColumnInfo[],
): ReporterFilter[] {
  const fc = toArray(params.fc);
  const fo = toArray(params.fo);
  const fv = toArray(params.fv);
  const fv2 = toArray(params.fv2);
  const types = new Map(columns.map((c) => [c.name, c.type]));

  const filters: ReporterFilter[] = [];
  for (let i = 0; i < fc.length && filters.length < MAX_FILTERS; i++) {
    const type = types.get(fc[i]);
    if (type === undefined) continue;
    const filter: ReporterFilter = {
      field: fc[i],
      op: (fo[i] ?? "") as FilterOp,
      value: opNeedsValue((fo[i] ?? "") as FilterOp) ? (fv[i] ?? "").trim() : "",
      value2: fo[i] === "entre" ? (fv2[i] ?? "").trim() : "",
    };
    if (!isCompleteFilter(filter, type)) continue;
    // "entre" con los límites invertidos: se ordenan para que el resumen se lea bien.
    if (filter.op === "entre") {
      const swap =
        kindOf(type) === "number"
          ? Number(filter.value) > Number(filter.value2)
          : filter.value > filter.value2; // fechas ISO: el orden de texto es cronológico
      if (swap) [filter.value, filter.value2] = [filter.value2, filter.value];
    }
    filters.push(filter);
  }
  return filters;
}

/** Escapa los comodines de LIKE para buscar el texto literal. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

/**
 * Arma la cláusula WHERE de los filtros (ya validados por resolveFilters).
 * Los nombres de columna están en la lista blanca de `columns`; los valores
 * viajan siempre como parámetros $n, empezando en $1.
 */
function buildWhere(
  filters: ReporterFilter[],
  columns: ColumnInfo[],
): { sql: string; params: unknown[] } {
  const types = new Map(columns.map((c) => [c.name, c.type]));
  const params: unknown[] = [];
  const add = (value: unknown) => {
    params.push(value);
    return `$${params.length}`;
  };

  const conditions = filters.flatMap((f) => {
    const type = types.get(f.field);
    if (type === undefined) return [];
    const col = `"${f.field}"`;
    const kind = kindOf(type);
    const cast = kind === "number" ? "::int" : kind === "date" ? "::date" : "";

    switch (f.op) {
      case "vacio":
        return [kind === "text" ? `(${col} IS NULL OR ${col} = '')` : `${col} IS NULL`];
      case "no_vacio":
        return [kind === "text" ? `(${col} IS NOT NULL AND ${col} <> '')` : `${col} IS NOT NULL`];
      case "contiene":
        return [`${col} ILIKE '%' || ${add(escapeLike(f.value))} || '%'`];
      case "empieza":
        return [`${col} ILIKE ${add(escapeLike(f.value))} || '%'`];
      case "igual":
        return [kind === "text" ? `LOWER(${col}) = LOWER(${add(f.value)})` : `${col} = ${add(f.value)}${cast}`];
      case "distinto":
        // IS DISTINCT FROM: los NULL también cuentan como "distintos".
        return [
          kind === "text"
            ? `LOWER(${col}) IS DISTINCT FROM LOWER(${add(f.value)})`
            : `${col} IS DISTINCT FROM ${add(f.value)}${cast}`,
        ];
      case "mayor":
        return [`${col} > ${add(f.value)}${cast}`];
      case "mayor_igual":
        return [`${col} >= ${add(f.value)}${cast}`];
      case "menor":
        return [`${col} < ${add(f.value)}${cast}`];
      case "menor_igual":
        return [`${col} <= ${add(f.value)}${cast}`];
      case "entre": {
        // BETWEEN SYMMETRIC acepta los límites en cualquier orden.
        return [`${col} BETWEEN SYMMETRIC ${add(f.value)}${cast} AND ${add(f.value2)}${cast}`];
      }
      default:
        return [];
    }
  });

  return {
    sql: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

/** Devuelve la tabla de la URL si es válida; si no, la tabla por defecto. */
export function resolveTable(
  params: Record<string, string | string[] | undefined>,
): TableName {
  const tabla = Array.isArray(params.tabla) ? params.tabla[0] : params.tabla;
  return isTableName(tabla) ? tabla : DEFAULT_TABLE;
}

/**
 * Sección 04 · Filas de la tabla elegida: solo los campos seleccionados,
 * filtradas, ordenadas y paginadas. Los valores se devuelven como texto
 * listo para mostrar.
 *
 * @param columns todas las columnas de la tabla (para validar los filtros).
 */
export async function getRows(
  q: ReporterQuery,
  columns: ColumnInfo[],
): Promise<RowsPage> {
  const where = buildWhere(q.filters, columns);

  // Total de registros que cumplen los filtros, para calcular las páginas.
  const [{ total }] = await query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM "${q.table}" ${where.sql}`,
    where.params,
  );
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(q.page, totalPages); // evita páginas fuera de rango

  // q.table, q.fields y q.orderBy ya están validados (ver resolveTable /
  // resolveQuery); los valores de filtro, LIMIT y OFFSET viajan como
  // parámetros, numerados después de los del WHERE.
  const selected = columns.filter((c) => q.fields.includes(c.name));
  const n = where.params.length;
  const raw = await query<Record<string, unknown>>(
    `SELECT ${selected.map((c) => `"${c.name}"`).join(", ")}
       FROM "${q.table}"
       ${where.sql}
      ORDER BY "${q.orderBy}" ${q.dir === "desc" ? "DESC" : "ASC"} NULLS LAST
      LIMIT $${n + 1} OFFSET $${n + 2}`,
    [...where.params, PAGE_SIZE, (page - 1) * PAGE_SIZE],
  );

  const dateColumns = new Set(
    selected.filter((c) => c.type === "fecha").map((c) => c.name),
  );

  // Formato de cada celda: NULL -> "—", fechas -> dd/mm/aaaa, resto -> texto.
  const rows: Row[] = raw.map((record) =>
    Object.fromEntries(
      selected.map(({ name }) => {
        const value = record[name];
        if (value === null || value === undefined) return [name, "—"];
        const text = String(value);
        return [name, dateColumns.has(name) ? formatDate(text) : text];
      }),
    ),
  );

  return { rows, total, page, pageSize: PAGE_SIZE, totalPages };
}

/**
 * Sección 05 · Indicadores consolidados del departamento.
 * El cumplimiento considera solo los mantenimientos programados hasta la
 * fecha de corte (los futuros todavía no pueden estar realizados).
 */
export async function getKpis(): Promise<Kpis> {
  const [row] = await query<{
    equipos: number;
    equipos_con_falla: number;
    mantenimientos_pendientes: number;
    cumplimiento: number | null;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM equipo)::int AS equipos,
       (SELECT COUNT(*)
          FROM equipo e
          JOIN estado_operativo s ON s.id_estado = e.id_estado
         WHERE s.nombre_estado IN ('Con falla', 'Fuera de servicio'))::int AS equipos_con_falla,
       (SELECT COUNT(*) FROM mantenimiento WHERE estatus = 'Pendiente')::int AS mantenimientos_pendientes,
       (SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE estatus = 'Realizado') / NULLIF(COUNT(*), 0), 1)
          FROM mantenimiento
         WHERE fecha_programada <= $1)::float AS cumplimiento`,
    [FECHA_CORTE],
  );

  return {
    equipos: row.equipos,
    equiposConFalla: row.equipos_con_falla,
    mantenimientosPendientes: row.mantenimientos_pendientes,
    cumplimiento: row.cumplimiento ?? 0,
  };
}
