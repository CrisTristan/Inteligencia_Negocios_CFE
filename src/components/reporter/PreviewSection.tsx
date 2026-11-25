import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileSpreadsheet, FileText, Printer } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { COMPANY, DOCUMENT } from "@/config/reporter";
import { formatDate, formatNumber } from "@/lib/format";
import { describeFilter } from "@/lib/filters";
import { reporterHref } from "@/lib/url";
import type { ColumnInfo, ReporterQuery, RowsPage } from "@/types/reporter";

interface PreviewSectionProps {
  title: string;
  /** Columnas seleccionadas en la sección 03 (las que se muestran). */
  columns: ColumnInfo[];
  /** Todas las columnas de la tabla (tipos para describir los filtros). */
  allColumns: ColumnInfo[];
  data: RowsPage;
  query: ReporterQuery;
}

/**
 * Sección 04 · Resultado de la consulta presentado como hoja imprimible:
 * solo los campos seleccionados y los registros que cumplen los filtros.
 * Los botones Imprimir / Exportar todavía son solo visuales.
 */
export function PreviewSection({ title, columns, allColumns, data, query }: PreviewSectionProps) {
  const from = data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
  const to = Math.min(data.page * data.pageSize, data.total);
  const typeOf = (field: string) => allColumns.find((c) => c.name === field)?.type ?? "texto";
  const filterText = query.filters.map((f) => describeFilter(f, typeOf(f.field))).join(" · ");

  return (
    <SectionCard
      number="04"
      title="Cuerpo del reporte y previsualización"
      subtitle="Vista lista para impresión o exportación · datos ficticios"
    >
      {/* ---------- Herramientas de previsualización ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <p className="flex items-center gap-3 text-xs text-slate-500">
          <Badge tone="success">Vista actualizada</Badge>
          {formatNumber(data.total)} registros encontrados · {columns.length} columnas
        </p>
        <div className="flex flex-wrap gap-2">
          <Button>
            <Printer className="size-4" aria-hidden /> Imprimir
          </Button>
          <Button variant="soft">
            <FileSpreadsheet className="size-4" aria-hidden /> Exportar XLSX
          </Button>
          <Button variant="primary">
            <FileText className="size-4" aria-hidden /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* ---------- Hoja del reporte (lienzo de impresión) ---------- */}
      <div className="bg-slate-100 p-4 sm:p-8">
        <article className="mx-auto max-w-[1240px] bg-surface px-6 py-7 shadow-md sm:px-8">
          {/* Encabezado impreso: datos de las secciones 01 y 02 */}
          <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-slate-900">{COMPANY.empresa}</p>
              <p className="text-xs text-slate-500">
                {COMPANY.departamento} · {COMPANY.zona}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-primary">{title}</h3>
              {filterText && (
                <p className="mt-0.5 max-w-2xl text-[11px] text-slate-500">
                  <span className="font-semibold">Filtros:</span> {filterText}
                </p>
              )}
            </div>
            <div className="text-right text-xs text-slate-500">
              <p className="font-mono font-bold text-slate-900">{DOCUMENT.numero}</p>
              <p>Emisión: {formatDate(DOCUMENT.fechaEmision)}</p>
              <p className="text-slate-400">
                Página {data.page} de {data.totalPages}
              </p>
            </div>
          </header>

          {/* Tabla de resultados: encabezado oscuro y filas alternas */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy text-[10px] uppercase text-white dark:bg-slate-200">
                <tr>
                  {columns.map((c) => (
                    <th key={c.name} className="px-3 py-2.5 font-bold whitespace-nowrap">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-slate-500">
                      {query.filters.length > 0
                        ? "Ningún registro coincide con los filtros aplicados."
                        : "La tabla no tiene registros."}
                    </td>
                  </tr>
                )}
                {data.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line even:bg-slate-50">
                    {columns.map((c) => (
                      <td key={c.name} className="px-3 py-2 whitespace-nowrap text-slate-700">
                        {row[c.name]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación por URL (?page=) */}
          <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <p>
              Mostrando {from}-{to} de {formatNumber(data.total)} registros
            </p>
            <Pagination
              query={{ ...query, page: data.page }}
              totalPages={data.totalPages}
              totalColumns={allColumns.length}
            />
          </footer>
        </article>
      </div>
    </SectionCard>
  );
}

/**
 * Controles de página: anterior, hasta 5 números alrededor de la página
 * actual y siguiente. Cada uno es un <Link> a la misma vista con otro ?page=.
 */
function Pagination({
  query,
  totalPages,
  totalColumns,
}: {
  query: ReporterQuery;
  totalPages: number;
  totalColumns: number;
}) {
  const start = Math.max(1, Math.min(query.page - 2, totalPages - 4));
  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  const base = "grid size-7 place-items-center rounded-md border text-xs font-semibold";
  // Cada enlace conserva campos y filtros; solo cambia ?page=.
  const href = (page: number) => reporterHref(query, { page }, totalColumns);

  return (
    <nav className="flex gap-1.5" aria-label="Paginación">
      <PageLink href={href(query.page - 1)} disabled={query.page <= 1} className={base} label="Página anterior">
        <ChevronLeft className="size-3.5" aria-hidden />
      </PageLink>
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          scroll={false}
          aria-current={p === query.page ? "page" : undefined}
          className={`${base} ${
            p === query.page
              ? "border-primary bg-primary text-white"
              : "border-slate-300 bg-surface text-slate-700 hover:bg-slate-50"
          }`}
        >
          {p}
        </Link>
      ))}
      <PageLink href={href(query.page + 1)} disabled={query.page >= totalPages} className={base} label="Página siguiente">
        <ChevronRight className="size-3.5" aria-hidden />
      </PageLink>
    </nav>
  );
}

/** Flecha de paginación; cuando no hay a dónde ir se muestra deshabilitada. */
function PageLink({
  href,
  disabled,
  className,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  className: string;
  label: string;
  children: ReactNode;
}) {
  if (disabled) {
    return (
      <span aria-disabled className={`${className} border-transparent bg-slate-100 text-slate-300`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} scroll={false} aria-label={label} className={`${className} border-slate-300 bg-surface text-slate-700 hover:bg-slate-50`}>
      {children}
    </Link>
  );
}
