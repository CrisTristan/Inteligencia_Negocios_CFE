"use client";
/**
 * Gráfica de columnas verticales, una o varias series, opcionalmente
 * apiladas. Uso: mantenimientos por mes (realizado / vencido / programado).
 *
 * @example
 *   <ColumnChart labels={["Ene 25", "Feb 25"]} stacked
 *     datasets={[{ label: "Realizado", data: [9, 15], color: SERIES.blue }]} />
 */
import { Bar } from "react-chartjs-2";
import type { ChartOptions, ScriptableContext } from "chart.js";
import "./setup";
import { useChartTheme } from "./useChartTheme";
import type { ChartDataset } from "@/types/charts";

interface ColumnChartProps {
  labels: string[];
  datasets: ChartDataset[];
  /** Apila las series en una sola columna por categoría. */
  stacked?: boolean;
  ariaLabel: string;
  /** Alto en px (por defecto 260). */
  height?: number;
}

export function ColumnChart({ labels, datasets, stacked = false, ariaLabel, height = 260 }: ColumnChartProps) {
  const theme = useChartTheme();

  // En columnas apiladas solo se redondea el segmento superior de cada mes.
  const radius = (ctx: ScriptableContext<"bar">) => {
    if (!stacked) return 4;
    const topIndex = datasets.findLastIndex((d) => (d.data[ctx.dataIndex] ?? 0) > 0);
    return ctx.datasetIndex === topIndex
      ? { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 }
      : 0;
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: "index", intersect: false }, // tooltip de todo el mes
    scales: {
      x: {
        stacked,
        grid: { display: false },
        border: { color: theme.grid },
        ticks: { color: theme.tick, font: { size: 11 }, autoSkip: true, maxRotation: 0 },
      },
      y: {
        stacked,
        beginAtZero: true,
        grid: { color: theme.grid },
        border: { display: false },
        ticks: { color: theme.tick, font: { size: 11 }, precision: 0 },
      },
    },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: "bottom",
        labels: { color: theme.text, boxWidth: 10, boxHeight: 10, padding: 16, font: { size: 11 } },
      },
      tooltip: { boxPadding: 4 },
    },
  };

  return (
    <div style={{ height }}>
      <Bar
        role="img"
        aria-label={ariaLabel}
        data={{
          labels,
          datasets: datasets.map((d) => ({
            label: d.label,
            data: d.data,
            backgroundColor: theme.resolve(d.color),
            // Separación de 2px (color de la tarjeta) entre segmentos apilados.
            borderColor: theme.surface,
            borderWidth: stacked ? { top: 2 } : 0,
            borderSkipped: "start",
            borderRadius: radius,
            maxBarThickness: 18,
          })),
        }}
        options={options}
      />
    </div>
  );
}
