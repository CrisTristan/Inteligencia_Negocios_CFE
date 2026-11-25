"use client";
/**
 * Colores del tema para Chart.js (que pinta en <canvas> y no entiende clases
 * de Tailwind ni variables CSS). Lee los tokens de globals.css y se vuelve a
 * calcular cuando ThemeToggle cambia el atributo data-theme de <html>.
 */
import { useSyncExternalStore } from "react";
import { Chart } from "./setup";
import type { ChartColor } from "@/types/charts";

export type ThemeMode = "light" | "dark";

export interface ChartTheme {
  mode: ThemeMode;
  /** Texto de ejes y etiquetas. */
  tick: string;
  /** Texto de leyendas y valores. */
  text: string;
  /** Líneas de cuadrícula. */
  grid: string;
  /** Fondo de la tarjeta (para separaciones y anillos de los puntos). */
  surface: string;
  font: string;
  /** Convierte un ChartColor en el hex del modo activo. */
  resolve: (color: ChartColor) => string;
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getSnapshot = (): ThemeMode =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
const getServerSnapshot = (): ThemeMode => "light";

/** Los tokens de un modo no cambian: se leen una vez por modo. */
const cache = new Map<ThemeMode, ChartTheme>();

function themeFor(mode: ThemeMode): ChartTheme {
  const fallback = mode === "dark"
    ? { tick: "#94a3b8", text: "#cbd5e1", grid: "#233244", surface: "#121e2a" }
    : { tick: "#64748b", text: "#334155", grid: "#e2e8f0", surface: "#ffffff" };
  const resolve = (color: ChartColor) => (typeof color === "string" ? color : color[mode]);

  if (typeof window === "undefined") return { mode, ...fallback, font: "sans-serif", resolve };

  const cached = cache.get(mode);
  if (cached && getSnapshot() === mode) return cached;

  const css = getComputedStyle(document.documentElement);
  const read = (name: string, value: string) => css.getPropertyValue(name).trim() || value;
  const font = getComputedStyle(document.body).fontFamily || "sans-serif";
  Chart.defaults.font.family = font;

  const theme: ChartTheme = {
    mode,
    tick: read("--color-slate-500", fallback.tick),
    text: read("--color-slate-700", fallback.text),
    grid: read("--color-line", fallback.grid),
    surface: read("--color-surface", fallback.surface),
    font,
    resolve,
  };
  // Solo se guarda si los estilos ya corresponden a ese modo.
  if (getSnapshot() === mode) cache.set(mode, theme);
  return theme;
}

export function useChartTheme(): ChartTheme {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return themeFor(mode);
}
