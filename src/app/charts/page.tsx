import { Suspense } from "react";
import type { Metadata } from "next";
import { AppBar } from "@/components/layout/AppBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartFilters } from "@/components/dashboard/ChartFilters";
import { HorizontalChart } from "@/components/charts/HorizontalChart";
import { ColumnChart } from "@/components/charts/ColumnChart";
import { LineChart } from "@/components/charts/LineChart";
import { APP, FECHA_CORTE } from "@/config/reporter";
import { CHARTS_PAGE, ESTADOS, NEUTRAL, SERIES, YEAR_COLORS } from "@/config/charts";
import { formatDateMedium, formatNumber, monthLabel, MONTHS_SHORT } from "@/lib/format";
import { getChartFilterOptions, getDashboard, resolveChartFilters } from "@/lib/queries/charts";

export const metadata: Metadata = {
  title: "SIGIAM-CC · Gráficas",
  description: "Tablero de inventario y mantenimiento del Departamento de Control y Comunicaciones.",
};

/**
 * Vista /charts · Tablero de gráficas de inventario y mantenimiento.
 *
 * Igual que /reporter (Next.js 16 con `cacheComponents`): la barra superior
 * se envía de inmediato y <ChartsContent>, que lee la URL y consulta
 * PostgreSQL, se transmite dentro de <Suspense>.
 */
export default function ChartsPage({ searchParams }: PageProps<"/charts">) {
  return (
    <>
      <AppBar />
      <main className="mx-auto max-w-[1440px] space-y-4 px-4 py-8 sm:px-8 lg:px-16">
        <Suspense fallback={<ChartsSkeleton />}>
          <ChartsContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

async function ChartsContent({ searchParams }: { searchParams: PageProps<"/charts">["searchParams"] }) {
  const params = await searchParams;
  const options = await getChartFilterOptions();
  const filters = resolveChartFilters(params, options);
  const d = await getDashboard(filters, options);
  const k = d.kpis;

  const pct = (part: number, total: number) => (total > 0 ? Math.round((100 * part) / total) : 0);
  const years = d.cumplimientoMensual.map((s) => s.anio);
  const yearRange = years.length > 1 ? `${years[0]} – ${years[years.length - 1]}` : String(years[0] ?? "");
  const estadoColor = (label: string) => ESTADOS.find((s) => s.nombre === label)?.color ?? "#94a3b8";

  // Escala del cumplimiento: de 50 % (o menos si algún mes baja de ahí) a 100 %.
  const minPct = Math.min(
    50,
    ...d.cumplimientoMensual.flatMap((s) => s.data.filter((v): v is number => v !== null)),
  );

  const heading = (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">
        <span className="text-primary dark:text-sky-300">{APP.name}</span> · {CHARTS_PAGE.title}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {CHARTS_PAGE.subtitle} · corte al {formatDateMedium(FECHA_CORTE)} · datos de ejemplo
      </p>
    </div>
  );

  return (
    <ChartFilters heading={heading} options={options} filters={filters}>
      {/* ---------- Indicadores ---------- */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Equipos registrados"
          value={formatNumber(k.equipos)}
          detail={`${k.tipos} ${k.tipos === 1 ? "tipo" : "tipos"} de equipo`}
        />
        <KpiCard
          label="En funcionamiento"
          value={pct(k.funcionando, k.equipos)}
          unit="%"
          detail={`${k.funcionando} de ${k.equipos} equipos`}
          progress={pct(k.funcionando, k.equipos)}
        />
        <KpiCard
          label="Con falla / fuera de servicio"
          value={k.conFalla + k.fueraServicio}
          tone={k.conFalla + k.fueraServicio > 0 ? "danger" : "default"}
          detail={`${k.conFalla} con falla · ${k.fueraServicio} fuera de servicio`}
        />
        <KpiCard
          label="Mantenimientos realizados"
          value={formatNumber(k.realizados)}
          detail={`${k.realizadosPreventivos} preventivos · ${k.realizadosCorrectivos} correctivos`}
        />
        <KpiCard
          label="Pendientes"
          value={k.pendientes}
          tone={k.pendientes > 0 ? "danger" : "default"}
          detail={`${k.vencidos} vencidos · ${k.programados} programados`}
        />
        <KpiCard
          label="Cumplimiento preventivo"
          value={k.cumplimiento ?? "—"}
          unit={k.cumplimiento === null ? undefined : "%"}
          detail="Realizados / programados a la fecha"
          progress={k.cumplimiento ?? 0}
        />
      </div>

      {/* ---------- Barras horizontales ---------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Equipos por tipo"
          meta={`${k.equipos} equipos`}
          table={{ headers: ["Tipo", "Equipos"], rows: d.porTipo.map((r) => [r.label, r.value]) }}
        >
          <HorizontalChart
            labels={d.porTipo.map((r) => r.label)}
            values={d.porTipo.map((r) => r.value)}
            color={SERIES.blue}
            valueLabel="Equipos"
            ariaLabel="Número de equipos por tipo"
          />
        </ChartCard>

        <ChartCard
          title="Estado operativo"
          meta="equipos por estado"
          footer="Verde: funcionando · amarillo: en mantenimiento · naranja: con falla · rojo: fuera de servicio."
          table={{ headers: ["Estado", "Equipos"], rows: d.porEstado.map((r) => [r.label, r.value]) }}
        >
          <HorizontalChart
            labels={d.porEstado.map((r) => r.label)}
            values={d.porEstado.map((r) => r.value)}
            color={d.porEstado.map((r) => estadoColor(r.label))}
            valueLabel="Equipos"
            ariaLabel="Número de equipos por estado operativo"
          />
        </ChartCard>

        <ChartCard
          title="Equipos por marca"
          meta={`${d.porMarca.length} ${d.porMarca.length === 1 ? "marca" : "marcas"}`}
          table={{ headers: ["Marca", "Equipos"], rows: d.porMarca.map((r) => [r.label, r.value]) }}
        >
          <HorizontalChart
            labels={d.porMarca.map((r) => r.label)}
            values={d.porMarca.map((r) => r.value)}
            color={SERIES.blue}
            valueLabel="Equipos"
            ariaLabel="Número de equipos por marca"
          />
        </ChartCard>
      </div>

      {/* ---------- Columnas y líneas ---------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Mantenimientos por mes"
          meta={`${yearRange} · por fecha programada`}
          table={{
            headers: ["Mes", "Realizado", "Vencido", "Programado"],
            rows: d.porMes.map((r) => [monthLabel(r.mes), r.realizados, r.vencidos, r.programados]),
          }}
        >
          <ColumnChart
            stacked
            labels={d.porMes.map((r) => monthLabel(r.mes))}
            datasets={[
              { label: "Realizado", data: d.porMes.map((r) => r.realizados), color: SERIES.blue },
              { label: "Vencido", data: d.porMes.map((r) => r.vencidos), color: SERIES.orange },
              { label: "Programado", data: d.porMes.map((r) => r.programados), color: SERIES.aqua },
            ]}
            ariaLabel="Mantenimientos por mes: realizados, vencidos y programados"
          />
        </ChartCard>

        <ChartCard
          title={`Cumplimiento preventivo: ${years.join(" vs ")}`}
          meta="% realizado por mes"
          table={{
            headers: ["Mes", ...years.map(String)],
            rows: MONTHS_SHORT.map((m, i) => [
              m,
              ...d.cumplimientoMensual.map((s) => (s.data[i] === null ? "—" : `${s.data[i]}%`)),
            ]),
          }}
        >
          <LineChart
            labels={MONTHS_SHORT}
            format="percent"
            yMin={Math.floor(minPct / 10) * 10}
            yMax={100}
            datasets={d.cumplimientoMensual.map((s, i) => ({
              label: String(s.anio),
              data: s.data,
              color: YEAR_COLORS[i % YEAR_COLORS.length],
            }))}
            ariaLabel="Porcentaje de mantenimientos preventivos realizados por mes, por año"
          />
        </ChartCard>
      </div>

      {/* ---------- Subestaciones y Pareto de fallas ---------- */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Equipos por subestación"
          meta={`${d.porSubestacion.length} ${d.porSubestacion.length === 1 ? "ubicación" : "ubicaciones"}`}
          table={{
            headers: ["Subestación", "Equipos"],
            rows: d.porSubestacion.map((r) => [r.label, r.value]),
          }}
        >
          <HorizontalChart
            labels={d.porSubestacion.map((r) => r.label)}
            values={d.porSubestacion.map((r) => r.value)}
            color={SERIES.blue}
            valueLabel="Equipos"
            ariaLabel="Número de equipos por subestación"
          />
        </ChartCard>

        <ChartCard
          title="Pareto de fallas (correctivos por equipo)"
          meta={`top ${d.pareto.rows.length}`}
          footer={
            d.pareto.totalCorrectivos > 0 && (
              <p>
                <strong className="font-semibold text-slate-900">{d.pareto.vitales}</strong> de{" "}
                {d.pareto.equiposConFalla} equipos con fallas concentran el 80 % de los{" "}
                {d.pareto.totalCorrectivos} correctivos (barras azules): ahí conviene priorizar el mantenimiento.
              </p>
            )
          }
          table={{
            headers: ["Equipo", "Correctivos", "Dentro del 80 %"],
            rows: d.pareto.rows.map((r) => [r.label, r.value, r.vital ? "Sí" : "No"]),
          }}
        >
          <HorizontalChart
            labels={d.pareto.rows.map((r) => r.label)}
            values={d.pareto.rows.map((r) => r.value)}
            color={d.pareto.rows.map((r) => (r.vital ? SERIES.blue : NEUTRAL))}
            valueLabel="Correctivos"
            ariaLabel="Equipos con más mantenimientos correctivos; en azul los que concentran el 80 %"
          />
        </ChartCard>
      </div>
    </ChartFilters>
  );
}

/** Marcadores grises mientras llegan los datos. */
function ChartsSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Cargando gráficas">
      <div className="h-14 w-1/2 rounded-xl bg-surface" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-28 rounded-xl bg-surface" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-72 rounded-xl bg-surface" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-80 rounded-xl bg-surface" />
        <div className="h-80 rounded-xl bg-surface" />
      </div>
    </div>
  );
}
