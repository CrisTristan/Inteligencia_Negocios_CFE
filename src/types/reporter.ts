/**
 * Tipos compartidos por la capa de datos (src/lib/queries) y los
 * componentes de la vista /reporter.
 */

/** Nombres de las tablas del esquema que se pueden consultar en el reporteador. */
export type TableName =
  | "equipo"
  | "mantenimiento"
  | "tipo_equipo"
  | "marca"
  | "ubicacion"
  | "estado_operativo"
  | "trabajador";

/** Dirección del ordenamiento: A-Z (asc) o Z-A (desc). */
export type SortDir = "asc" | "desc";

/** Tabla disponible con su número de campos (sección 03). */
export interface TableInfo {
  name: TableName;
  label: string;
  description: string;
  displayColumns: string[];
  fieldCount: number;
}

/** Campo (columna) de una tabla con su tipo de dato legible (sección 03). */
export interface ColumnInfo {
  name: string;
  /** Tipo traducido para mostrar: "entero", "texto", "fecha", ... */
  type: string;
}

/** Una fila genérica: columna -> valor ya formateado como texto. */
export type Row = Record<string, string>;

/** Resultado paginado de la consulta (sección 04). */
export interface RowsPage {
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Indicadores consolidados del departamento (sección 05). */
export interface Kpis {
  equipos: number;
  equiposConFalla: number;
  mantenimientosPendientes: number;
  /** Porcentaje de mantenimientos programados (hasta la fecha de corte) que se realizaron. */
  cumplimiento: number;
}

/** Operadores de filtro disponibles (cuáles aplican depende del tipo del campo). */
export type FilterOp =
  | "contiene"
  | "igual"
  | "distinto"
  | "empieza"
  | "mayor"
  | "mayor_igual"
  | "menor"
  | "menor_igual"
  | "entre"
  | "vacio"
  | "no_vacio";

/** Un filtro de la sección 03: campo, condición y valor(es). */
export interface ReporterFilter {
  field: string;
  op: FilterOp;
  /** Valor principal ("" si el operador no lo requiere). */
  value: string;
  /** Segundo valor, solo para "entre". */
  value2: string;
}

/**
 * Llave foránea de la tabla consultada, con los detalles de la tabla a la
 * que hace referencia (panel "Detalles tabla foránea" de la sección 03).
 */
export interface ForeignKeyInfo {
  /** Columna de la tabla consultada: "id_tipo". */
  column: string;
  refTable: TableName;
  /** Llave primaria referenciada: "id_tipo". */
  refColumn: string;
  refLabel: string;
  refDescription: string;
  /** Columnas de la tabla referenciada. */
  refColumns: ColumnInfo[];
  /** Columnas que se muestran si el usuario no elige otras. */
  defaultColumns: string[];
  /** Número de registros de la tabla referenciada. */
  total: number;
  /** Primeras filas de la tabla referenciada, ya formateadas. */
  sample: Row[];
}

/** Columna final del cuerpo del reporte (sección 04). */
export interface ReportColumn {
  /** Clave de la celda en cada fila: "modelo" o "id_tipo__nombre_tipo". */
  key: string;
  /** Encabezado: "modelo", "nombre_tipo" (o "tabla.columna" si se repite). */
  label: string;
  type: string;
  /** "fk" = viene de la tabla referenciada por una llave foránea. */
  source: "own" | "fk";
  /** Solo en columnas foráneas: la llave y la columna de la tabla referenciada. */
  fk?: string;
  refColumn?: string;
}

/** Parámetros de la consulta ya validados que llegan desde la URL. */
export interface ReporterQuery {
  table: TableName;
  /** Campos seleccionados, en el orden de la tabla (nunca vacío). */
  fields: string[];
  /** Por cada llave foránea, las columnas de su tabla que se muestran (nunca vacío). */
  relations: Record<string, string[]>;
  /** Filtros válidos; se combinan con AND. */
  filters: ReporterFilter[];
  orderBy: string;
  dir: SortDir;
  page: number;
}
