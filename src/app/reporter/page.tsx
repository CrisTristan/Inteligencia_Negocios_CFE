import { Suspense } from "react";
import { AppBar } from "@/components/layout/AppBar";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompanySection } from "@/components/reporter/CompanySection";
import { DocumentSection } from "@/components/reporter/DocumentSection";
import { QuerySection } from "@/components/reporter/QuerySection";
import { PreviewSection } from "@/components/reporter/PreviewSection";
import { TotalsSection } from "@/components/reporter/TotalsSection";
import { ValidationSection } from "@/components/reporter/ValidationSection";
import { NotesSection } from "@/components/reporter/NotesSection";
import { TABLE_CATALOG } from "@/config/reporter";
import {
  getColumns,
  getKpis,
  getRows,
  getTables,
  resolveQuery,
  resolveTable,
} from "@/lib/queries/reporter";

/**
 * Vista /reporter · Constructor de reportes de inventario y mantenimiento.
 *
 * Next.js 16 con `cacheComponents`: todo lo que depende de la petición
 * (searchParams y consultas a la base) debe ir dentro de <Suspense>. Por eso
 * la página se divide en:
 *   - un "shell" estático (barra y encabezado) que se envía de inmediato;
 *   - <ReporterContent>, que lee la URL, consulta PostgreSQL y se transmite
 *     (streaming) cuando los datos están listos.
 */
export default function ReporterPage({ searchParams }: PageProps<"/reporter">) {
  return (
    <>
      <AppBar />
      <main className="mx-auto max-w-[1440px] space-y-4 px-4 py-8 sm:px-8 lg:px-16">
        <PageHeader />
        <Suspense fallback={<ReporterSkeleton />}>
          <ReporterContent searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

/** Lee los parámetros de la URL, consulta la base y arma las 7 secciones. */
async function ReporterContent({
  searchParams,
}: {
  searchParams: PageProps<"/reporter">["searchParams"];
}) {
  const params = await searchParams;

  // 1) Tabla validada contra la lista blanca y sus columnas reales.
  const table = resolveTable(params);
  const columns = await getColumns(table);

  // 2) Campos, filtros, orden, dirección y página validados contra esas columnas.
  const query = resolveQuery(params, columns, table);

  // 3) Consultas independientes en paralelo.
  const [tables, data, kpis] = await Promise.all([
    getTables(),
    getRows(query, columns),
    getKpis(),
  ]);

  const { label } = TABLE_CATALOG[table];
  // Solo las columnas marcadas en la sección 03 se muestran en la 04.
  const selectedColumns = columns.filter((c) => query.fields.includes(c.name));

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <CompanySection />
        <DocumentSection tableLabel={label} />
      </div>
      <QuerySection tables={tables} columns={columns} query={query} />
      <PreviewSection
        title={`Reporte de ${label.toLowerCase()}`}
        columns={selectedColumns}
        allColumns={columns}
        data={data}
        query={query}
      />
      <TotalsSection totalRegistros={data.total} kpis={kpis} />
      <ValidationSection />
      <NotesSection />
    </>
  );
}

/** Marcadores grises que se muestran mientras llegan los datos. */
function ReporterSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Cargando reporte">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-48 rounded-xl bg-surface" />
        <div className="h-48 rounded-xl bg-surface" />
      </div>
      <div className="h-96 rounded-xl bg-surface" />
      <div className="h-[32rem] rounded-xl bg-surface" />
    </div>
  );
}
