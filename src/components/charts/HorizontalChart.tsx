"use client";
/**
 * Gráfica de barras horizontales (una sola serie), con el valor escrito al
 * final de cada barra. Uso: equipos por tipo, por estado, por marca...
 *
 * @example
 *   <HorizontalChart labels={["Eaton", "ABB"]} values={[17, 6]} color={SERIES.blue} valueLabel="Equipos" />
 */
import { Bar } from "react-chartjs-2";
import type { ChartOptions, Plugin } from "chart.js";
import "./setup";
import { useChartTheme } from "./useChartTheme";
import type { ChartColor } from "@/types/charts";

interface HorizontalChartProps {
  labels: string[];
  values: number[];
  /** Un color para todas las barras o uno por barra. */
  color: ChartColor | ChartColor[];
  /** Nombre del valor en el tooltip ("Equipos"). */
  valueLabel: string;
  /** Descripción para lectores de pantalla. */
  ariaLabel: string;
}

/** Alto de cada barra + separación, en px. */
const ROW_HEIGHT = 23;

/** Escribe el valor de cada barra a su derecha, con el color de texto del tema. */
const valueLabels: Plugin<"bar"> = {
  id: "valueLabels",
  afterDatasetsDraw(chart, _args, options) {
    if (!options || !("color" in options)) return;
    const { ctx } = chart;
    const values = chart.data.datasets[0]?.data ?? [];
    ctx.save();
    ctx.fillStyle = options.color;
    ctx.font = options.font;
    ctx.textBaseline = "middle";
    chart.getDatasetMeta(0).data.forEach((bar, i) => {
      ctx.fillText(String(values[i] ?? ""), bar.x + 6, bar.y);
    });
    ctx.restore();
  },
};

export function HorizontalChart({ labels, values, color, valueLabel, ariaLabel }: HorizontalChartProps) {
  const theme = useChartTheme();

  if (labels.length === 0) {
    return <p className="py-8 text-center text-xs text-slate-500">Sin datos con los filtros elegidos.</p>;
  }

  const backgroundColor = Array.isArray(color) ? color.map(theme.resolve) : theme.resolve(color);

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    layout: { padding: { right: 32 } }, // espacio para el valor
    scales: {
      x: { display: false, beginAtZero: true },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: theme.tick, font: { size: 11 } },
      },
    },
    plugins: {
      legend: { display: false }, // una sola serie: el título de la tarjeta la nombra
      tooltip: {
        displayColors: false,
        callbacks: { label: (item) => `${valueLabel}: ${item.formattedValue}` },
      },
      valueLabels: { color: theme.text, font: `600 11px ${theme.font}` },
    },
  };

  return (
    <div style={{ height: labels.length * ROW_HEIGHT + 12 }}>
      <Bar
        role="img"
        aria-label={ariaLabel}
        data={{
          labels,
          datasets: [
            {
              label: valueLabel,
              data: values,
              backgroundColor,
              borderRadius: 4,
              borderSkipped: "start", // esquinas redondeadas solo en el extremo del dato
              maxBarThickness: 16,
              categoryPercentage: 0.9,
              barPercentage: 0.9,
            },
          ],
        }}
        options={options}
        plugins={[valueLabels]}
      />
    </div>
  );
}
