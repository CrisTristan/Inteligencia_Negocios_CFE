/**
 * Paleta y textos del tablero /charts.
 *
 * Colores de serie: paleta categórica validada (skill dataviz) en orden fijo
 * azul → naranja → aqua, con un tono propio para modo oscuro. Se validó contra
 * las superficies de la app (#ffffff y #121e2a): separación para daltonismo
 * ΔE ≥ 9 en ambos modos. El aqua queda bajo 3:1 en claro, por eso cada
 * gráfica ofrece además su tabla de datos ("Ver tabla de datos").
 */
import type { ChartColor } from "@/types/charts";

export const SERIES = {
  blue: { light: "#2a78d6", dark: "#3987e5" },
  orange: { light: "#eb6834", dark: "#d95926" },
  aqua: { light: "#1baf7a", dark: "#199e70" },
} satisfies Record<string, ChartColor>;

/** Gris para lo secundario (p. ej. equipos fuera del 80 % en el Pareto). */
export const NEUTRAL: ChartColor = { light: "#b8c2cf", dark: "#4b5563" };

/** Colores de estado (reservados: no se usan para otras series). */
export const STATUS = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
} as const;

/**
 * Estados operativos en orden de severidad (como en el diseño) con su color.
 * Un estado que no esté aquí va al final en gris.
 */
export const ESTADOS: { nombre: string; color: string }[] = [
  { nombre: "En funcionamiento", color: STATUS.good },
  { nombre: "En mantenimiento", color: STATUS.warning },
  { nombre: "Con falla", color: STATUS.serious },
  { nombre: "Fuera de servicio", color: STATUS.critical },
];

/** Color de cada año en la gráfica de cumplimiento (orden fijo por año). */
export const YEAR_COLORS: ChartColor[] = [SERIES.blue, SERIES.orange, SERIES.aqua];

export const CHARTS_PAGE = {
  title: "Inventario y mantenimiento",
  subtitle: "Departamento de Control y Comunicaciones · CFE",
};
