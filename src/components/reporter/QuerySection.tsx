import Link from "next/link";
import {
  Box,
  ChevronUp,
  CircleDot,
  HardHat,
  Layers,
  MapPin,
  Tags,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { QueryForm } from "@/components/reporter/QueryForm";
import { reporterHref, type HrefDefaults } from "@/lib/url";
import type { ColumnInfo, ForeignKeyInfo, ReporterQuery, TableInfo, TableName } from "@/types/reporter";

/** Ícono de cada tabla en la lista "Tablas disponibles". */
const TABLE_ICONS: Record<TableName, LucideIcon> = {
  equipo: Box,
  mantenimiento: Wrench,
  tipo_equipo: Layers,
  marca: Tags,
  ubicacion: MapPin,
  estado_operativo: CircleDot,
  trabajador: HardHat,
};

interface QuerySectionProps {
  tables: TableInfo[];
  columns: ColumnInfo[];
  foreignKeys: ForeignKeyInfo[];
  query: ReporterQuery;
  hrefDefaults: HrefDefaults;
}

/**
 * Sección 03 · Consulta: tablas, campos, filtros y ordenamiento.
 *
 *   - Cada tabla es un <Link> que cambia ?tabla= (y reinicia campos y filtros).
 *   - Campos, filtros y orden viven en <QueryForm> (Client Component): se
 *     editan libremente y se aplican al pulsar "Generar reporte" o A-Z / Z-A.
 */
export function QuerySection({ tables, columns, foreignKeys, query, hrefDefaults }: QuerySectionProps) {
  const current = tables.find((t) => t.name === query.table)!;

  return (
    <SectionCard
      number="03"
      title="Consulta: tablas, campos, filtros y ordenamiento"
      subtitle="Define la fuente y los criterios del reporte"
      aside={
        <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-primary">
          Expandido <ChevronUp className="size-3.5" aria-hidden />
        </span>
      }
    >
      {/*
        La key cambia con la consulta aplicada (sin contar la página): así el
        formulario se reinicia con el estado de la URL al cambiar de tabla o
        al aplicar, pero no al paginar.
      */}
      <QueryForm
        key={reporterHref(query, { page: 1 })}
        columns={columns}
        foreignKeys={foreignKeys}
        query={query}
        hrefDefaults={hrefDefaults}
        tableLabel={current.label}
      >
        {/* ---------- Tablas disponibles ---------- */}
        <Panel title="Tablas disponibles" meta={`${tables.length} tablas`}>
          <ul className="space-y-1 p-2">
            {tables.map((table) => {
              const Icon = TABLE_ICONS[table.name];
              const selected = table.name === query.table;
              return (
                <li key={table.name}>
                  <Link
                    href={`/reporter?tabla=${table.name}`}
                    scroll={false}
                    aria-current={selected ? "true" : undefined}
                    className={`flex items-center gap-3 rounded-md border-l-[3px] px-3 py-2.5 transition-colors ${
                      selected
                        ? "border-primary bg-slate-100"
                        : "border-transparent hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="size-4 shrink-0 text-slate-500" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {table.label}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        {table.fieldCount} campos
                      </span>
                    </span>
                    {selected && <Badge>Seleccionada</Badge>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>
      </QueryForm>
    </SectionCard>
  );
}
