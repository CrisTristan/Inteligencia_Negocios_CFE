"use client";
/**
 * Gráfica de líneas, una o varias series. Los `null` dejan un hueco (la
 * línea se corta). Uso: cumplimiento preventivo por mes, un año por serie.
 *
 * @example
 *   <LineChart labels={MONTHS_SHORT} format="percent" yMax={100}
 *     datasets={[{ label: "2025", data: [87.5, 100, ...], color: SERIES.blue }]} />
 */
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import "./setup";
import { useChartTheme } from "./useChartTheme";
import type { ChartDataset } from "@/types/charts";

interface LineChartProps {
  labels: string[];
  datasets: ChartDataset[];
  /** "percent" agrega % en el eje y el tooltip. */
  format?: "number" | "percent";
  yMin?: number;
  yMax?: number;
  ariaLabel: string;
  /** Alto en px (por defecto 260). */
  height?: number;
}

export function LineChart({
  labels,
  datasets,
  format = "number",
  yMin,
  yMax,
  ariaLabel,
  height = 260,
}: LineChartProps) {
  const theme = useChartTheme();
  const fmt = (v: number | string) => (format === "percent" ? `${v}%` : String(v));

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    interaction: { mode: "index", intersect: false }, // tooltip con todas las series del mes
    scales: {
      x: {
        grid: { display: false },
        border: { color: theme.grid },
        ticks: { color: theme.tick, font: { size: 11 } },
      },
      y: {
        min: yMin,
        max: yMax,
        grid: { color: theme.grid },
        border: { display: false },
        ticks: { color: theme.tick, font: { size: 11 }, callback: (v) => fmt(v) },
      },
    },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: "bottom",
        labels: { color: theme.text, boxWidth: 14, boxHeight: 2, padding: 16, font: { size: 11 } },
      },
      tooltip: {
        boxPadding: 4,
        callbacks: { label: (item) => `${item.dataset.label}: ${fmt(item.formattedValue)}` },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line
        role="img"
        aria-label={ariaLabel}
        data={{
          labels,
          datasets: datasets.map((d) => {
            const color = theme.resolve(d.color);
            return {
              label: d.label,
              data: d.data,
              borderColor: color,
              backgroundColor: color,
              borderWidth: 2,
              pointRadius: 4, // marcador de 8px
              pointHoverRadius: 6,
              pointBorderColor: theme.surface, // anillo de 2px del color de la tarjeta
              pointBorderWidth: 2,
              spanGaps: false,
              tension: 0,
            };
          }),
        }}
        options={options}
      />
    </div>
  );
}
