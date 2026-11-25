/**
 * Consultas de LECTURA para la vista /charts.
 *
 * Todas parten del mismo conjunto de equipos filtrado por zona y tipo (CTE
 * `eq`); las de mantenimiento además filtran por año (CTE `m`). Los filtros
 * viajan siempre como parámetros ($1, $2...) y se validan antes contra las
 * opciones que existen en la base (lista blanca).
 *
 * Definiciones (fecha de corte = FECHA_CORTE):
 *   - vencido    = Pendiente con fecha programada anterior al corte;
 *   - programado = Pendiente con fecha programada desde el corte;
 *   - cumplimiento preventivo = preventivos realizados / preventivos
 *     programados hasta el corte.
 */
import "server-only";
import { query } from "@/lib/db";
import { FECHA_CORTE } from "@/config/reporter";
import { ESTADOS } from "@/config/charts";
import type {
  ChartFilterOptions,
  ChartFilters,
  DashboardData,
  LabeledValue,
  ParetoData,
} from "@/types/charts";

/** Equipos filtrados por zona ($1) y tipo ($2). */
const EQ_CTE = `
  eq AS (
    SELECT e.id_equipo, e.id_tipo, e.id_marca, e.id_estado
      FROM equipo e
      JOIN ubicacion u ON u.id_ubicacion = e.id_ubicacion
     WHERE ($1::text IS NULL OR u.zona = $1)
       AND ($2::int IS NULL OR e.id_tipo = $2)
  )`;

/** Mantenimientos de esos equipos, filtrados por año ($3). */
const M_CTE = `${EQ_CTE},
  m AS (
    SELECT m.*
      FROM mantenimiento m
      JOIN eq ON eq.id_equipo = m.id_equipo
     WHERE ($3::int IS NULL OR EXTRACT(YEAR FROM m.fecha_programada) = $3)
  )`;

/** Opciones de los selectores: zonas, tipos de equipo y años con mantenimientos. */
export async function getChartFilterOptions(): Promise<ChartFilterOptions> {
  const [zonas, tipos, anios] = await Promise.all([
    query<{ zona: string }>(`SELECT DISTINCT zona FROM ubicacion ORDER BY zona`),
    query<{ id_tipo: number; nombre_tipo: string }>(
      `SELECT id_tipo, nombre_tipo FROM tipo_equipo ORDER BY nombre_tipo`,
    ),
    query<{ anio: number }>(
      `SELECT DISTINCT EXTRACT(YEAR FROM fecha_programada)::int AS anio
         FROM mantenimiento ORDER BY anio`,
    ),
  ]);
  return {
    zonas: zonas.map((r) => r.zona),
    tipos: tipos.map((r) => ({ id: r.id_tipo, nombre: r.nombre_tipo })),
    anios: anios.map((r) => r.anio),
  };
}

/** Valida ?zona=&tipo=&anio= contra las opciones reales; lo inválido = "Todos". */
export function resolveChartFilters(
  params: Record<string, string | string[] | undefined>,
  options: ChartFilterOptions,
): ChartFilters {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const zona = first(params.zona);
  const tipo = Number(first(params.tipo));
  const anio = Number(first(params.anio));

  return {
    zona: zona && options.zonas.includes(zona) ? zona : null,
    tipo: options.tipos.some((t) => t.id === tipo) ? tipo : null,
    anio: options.anios.includes(anio) ? anio : null,
  };
}

/** Calcula KPIs y series de las 5 gráficas con los filtros aplicados. */
export async function getDashboard(
  filters: ChartFilters,
  options: ChartFilterOptions,
): Promise<DashboardData> {
  const eqParams = [filters.zona, filters.tipo];
  const mParams = [filters.zona, filters.tipo, filters.anio, FECHA_CORTE];

  // Rango de meses de la gráfica mensual: el año elegido o todos los años.
  const years = filters.anio ? [filters.anio] : options.anios;
  const firstYear = years[0] ?? Number(FECHA_CORTE.slice(0, 4));
  const lastYear = years[years.length - 1] ?? firstYear;

  const [equipos, porTipo, porEstadoRaw, porMarca, mant, porMes, cumplimiento, porSubestacion, correctivos] =
    await Promise.all([
      query<{
        equipos: number;
        tipos: number;
        funcionando: number;
        con_falla: number;
        fuera_servicio: number;
      }>(
        `WITH ${EQ_CTE}
         SELECT COUNT(*)::int AS equipos,
                COUNT(DISTINCT eq.id_tipo)::int AS tipos,
                COUNT(*) FILTER (WHERE s.nombre_estado = 'En funcionamiento')::int AS funcionando,
                COUNT(*) FILTER (WHERE s.nombre_estado = 'Con falla')::int AS con_falla,
                COUNT(*) FILTER (WHERE s.nombre_estado = 'Fuera de servicio')::int AS fuera_servicio
           FROM eq
           JOIN estado_operativo s ON s.id_estado = eq.id_estado`,
        eqParams,
      ),
      query<LabeledValue>(
        `WITH ${EQ_CTE}
         SELECT t.nombre_tipo AS label, COUNT(*)::int AS value
           FROM eq JOIN tipo_equipo t ON t.id_tipo = eq.id_tipo
          GROUP BY t.nombre_tipo
          ORDER BY value DESC, label`,
        eqParams,
      ),
      query<LabeledValue>(
        `WITH ${EQ_CTE}
         SELECT s.nombre_estado AS label, COUNT(eq.id_equipo)::int AS value
           FROM estado_operativo s
           LEFT JOIN eq ON eq.id_estado = s.id_estado
          GROUP BY s.nombre_estado`,
        eqParams,
      ),
      query<LabeledValue>(
        `WITH ${EQ_CTE}
         SELECT k.nombre_marca AS label, COUNT(*)::int AS value
           FROM eq JOIN marca k ON k.id_marca = eq.id_marca
          GROUP BY k.nombre_marca
          ORDER BY value DESC, label`,
        eqParams,
      ),
      query<{
        realizados: number;
        prev: number;
        corr: number;
        pendientes: number;
        vencidos: number;
        programados: number;
        cumplimiento: number | null;
      }>(
        `WITH ${M_CTE}
         SELECT COUNT(*) FILTER (WHERE estatus = 'Realizado')::int AS realizados,
                COUNT(*) FILTER (WHERE estatus = 'Realizado' AND tipo_mantenimiento = 'Preventivo')::int AS prev,
                COUNT(*) FILTER (WHERE estatus = 'Realizado' AND tipo_mantenimiento = 'Correctivo')::int AS corr,
                COUNT(*) FILTER (WHERE estatus = 'Pendiente')::int AS pendientes,
                COUNT(*) FILTER (WHERE estatus = 'Pendiente' AND fecha_programada < $4::date)::int AS vencidos,
                COUNT(*) FILTER (WHERE estatus = 'Pendiente' AND fecha_programada >= $4::date)::int AS programados,
                ROUND(
                  100.0 * COUNT(*) FILTER (WHERE tipo_mantenimiento = 'Preventivo' AND estatus = 'Realizado' AND fecha_programada <= $4::date)
                  / NULLIF(COUNT(*) FILTER (WHERE tipo_mantenimiento = 'Preventivo' AND fecha_programada <= $4::date), 0),
                1)::float AS cumplimiento
           FROM m`,
        mParams,
      ),
      query<{ mes: string; realizados: number; vencidos: number; programados: number }>(
        `WITH ${M_CTE}
         SELECT to_char(g.mes, 'YYYY-MM') AS mes,
                COUNT(m.id_mantenimiento) FILTER (WHERE m.estatus = 'Realizado')::int AS realizados,
                COUNT(m.id_mantenimiento) FILTER (WHERE m.estatus = 'Pendiente' AND m.fecha_programada < $4::date)::int AS vencidos,
                COUNT(m.id_mantenimiento) FILTER (WHERE m.estatus = 'Pendiente' AND m.fecha_programada >= $4::date)::int AS programados
           FROM generate_series($5::date, $6::date, interval '1 month') AS g(mes)
           LEFT JOIN m ON date_trunc('month', m.fecha_programada) = g.mes
          GROUP BY g.mes
          ORDER BY g.mes`,
        [...mParams, `${firstYear}-01-01`, `${lastYear}-12-01`],
      ),
      query<{ anio: number; mes: number; pct: number }>(
        `WITH ${M_CTE}
         SELECT EXTRACT(YEAR FROM fecha_programada)::int AS anio,
                EXTRACT(MONTH FROM fecha_programada)::int AS mes,
                ROUND(100.0 * COUNT(*) FILTER (WHERE estatus = 'Realizado') / COUNT(*), 1)::float AS pct
           FROM m
          WHERE tipo_mantenimiento = 'Preventivo' AND fecha_programada <= $4::date
          GROUP BY 1, 2`,
        mParams,
      ),
      query<LabeledValue>(
        `WITH ${EQ_CTE}
         SELECT u.subestacion AS label, COUNT(*)::int AS value
           FROM eq
           JOIN equipo e ON e.id_equipo = eq.id_equipo
           JOIN ubicacion u ON u.id_ubicacion = e.id_ubicacion
          GROUP BY u.subestacion
          ORDER BY value DESC, label`,
        eqParams,
      ),
      // Todos los equipos con correctivos (el 80 % se calcula sobre el total).
      // No usa la fecha de corte, así que solo lleva $1–$3.
      query<LabeledValue>(
        `WITH ${M_CTE}
         SELECT e.num_economico AS label, COUNT(*)::int AS value
           FROM m
           JOIN equipo e ON e.id_equipo = m.id_equipo
          WHERE m.tipo_mantenimiento = 'Correctivo'
          GROUP BY e.num_economico
          ORDER BY value DESC, label`,
        [filters.zona, filters.tipo, filters.anio],
      ),
    ]);

  const e = equipos[0];
  const k = mant[0];

  // Estados en orden de severidad (config); los desconocidos al final.
  const rank = (label: string) => {
    const i = ESTADOS.findIndex((s) => s.nombre === label);
    return i === -1 ? ESTADOS.length : i;
  };
  const porEstado = [...porEstadoRaw].sort((a, b) => rank(a.label) - rank(b.label));

  // Una serie de 12 meses por año; los huecos quedan en null.
  const cumplimientoMensual = years.map((anio) => {
    const data: (number | null)[] = Array(12).fill(null);
    for (const r of cumplimiento) if (r.anio === anio) data[r.mes - 1] = r.pct;
    return { anio, data };
  });

  return {
    kpis: {
      equipos: e.equipos,
      tipos: e.tipos,
      funcionando: e.funcionando,
      conFalla: e.con_falla,
      fueraServicio: e.fuera_servicio,
      realizados: k.realizados,
      realizadosPreventivos: k.prev,
      realizadosCorrectivos: k.corr,
      pendientes: k.pendientes,
      vencidos: k.vencidos,
      programados: k.programados,
      cumplimiento: k.cumplimiento,
    },
    porTipo,
    porEstado,
    porMarca,
    porMes,
    cumplimientoMensual,
    porSubestacion,
    pareto: buildPareto(correctivos),
  };
}

/** Equipos que se muestran en el Pareto. */
const PARETO_TOP = 15;

/**
 * Regla 80/20: recorre los equipos de mayor a menor número de correctivos y
 * marca como "vitales" los necesarios para llegar al 80 % del total.
 */
function buildPareto(all: LabeledValue[]): ParetoData {
  const total = all.reduce((sum, r) => sum + r.value, 0);
  let acumulado = 0;
  let vitales = 0;
  for (const r of all) {
    if (acumulado >= 0.8 * total) break;
    acumulado += r.value;
    vitales++;
  }
  return {
    rows: all.slice(0, PARETO_TOP).map((r, i) => ({ ...r, vital: i < vitales })),
    totalCorrectivos: total,
    equiposConFalla: all.length,
    vitales,
  };
}
