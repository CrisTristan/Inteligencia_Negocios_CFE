/**
 * Registro único de Chart.js (lo importan los tres componentes de gráficas).
 * Chart.js es modular: solo se registran las piezas que se usan, así el
 * paquete que llega al navegador es más pequeño.
 */
import {
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartType,
} from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

/** Opciones del plugin propio `valueLabels` (valor al final de cada barra). */
declare module "chart.js" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface PluginOptionsByType<TType extends ChartType> {
    valueLabels?: { color: string; font: string } | false;
  }
}

export { Chart };
