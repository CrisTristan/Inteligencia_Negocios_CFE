/**
 * Tipos de la vista /charts (tablero de gráficas). Los comparten la capa de
 * datos (src/lib/queries/charts.ts) y los componentes de gráficas.
 */

/** Color de una serie: fijo o con un tono distinto para modo claro/oscuro. */
export type ChartColor = string | { light: string; dark: string };

/** Una serie de datos para ColumnChart / LineChart. */
export interface ChartDataset {
  label: string;
  /** `null` = sin dato (la línea se corta en ese punto). */
  data: (number | null)[];
  color: ChartColor;
}

/** Filtros aplicados (ya validados); `null` = "Todos". */
export interface ChartFilters {
  zona: string | null;
  tipo: number | null;
  anio: number | null;
}

/** Opciones de los selectores de filtro, leídas de la base. */
export interface ChartFilterOptions {
  zonas: string[];
  tipos: { id: number; nombre: string }[];
  anios: number[];
}

/** Par etiqueta-valor de una gráfica de barras horizontales. */
export interface LabeledValue {
  label: string;
  value: number;
}

/** Todo lo que pinta el tablero, calculado con los filtros aplicados. */
export interface DashboardData {
  kpis: {
    equipos: number;
    tipos: number;
    funcionando: number;
    conFalla: number;
    fueraServicio: number;
    realizados: number;
    realizadosPreventivos: number;
    realizadosCorrectivos: number;
    pendientes: number;
    vencidos: number;
    programados: number;
    /** % de preventivos realizados sobre los programados hasta el corte; null si no hay. */
    cumplimiento: number | null;
  };
  porTipo: LabeledValue[];
  porEstado: LabeledValue[];
  porMarca: LabeledValue[];
  /** Una entrada por mes del rango: "2025-01", ... */
  porMes: { mes: string; realizados: number; vencidos: number; programados: number }[];
  /** % de cumplimiento preventivo por año, 12 meses (null = sin dato o posterior al corte). */
  cumplimientoMensual: { anio: number; data: (number | null)[] }[];
  porSubestacion: LabeledValue[];
  pareto: ParetoData;
}

/** Pareto de fallas: correctivos por equipo y el grupo que concentra el 80 %. */
export interface ParetoData {
  /** Los equipos con más correctivos (top N); `vital` = dentro del 80 %. */
  rows: (LabeledValue & { vital: boolean })[];
  totalCorrectivos: number;
  equiposConFalla: number;
  /** Cuántos equipos (de mayor a menor) suman al menos el 80 % de los correctivos. */
  vitales: number;
}
