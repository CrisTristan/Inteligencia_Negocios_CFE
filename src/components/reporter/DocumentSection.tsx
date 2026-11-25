import { CalendarDays, Hash } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { Field } from "@/components/ui/Field";
import { DOCUMENT } from "@/config/reporter";
import { formatDate } from "@/lib/format";

interface DocumentSectionProps {
  /** Nombre legible de la tabla consultada; se usa para armar el asunto. */
  tableLabel: string;
}

/** Sección 02 · Datos de control administrativo del documento. */
export function DocumentSection({ tableLabel }: DocumentSectionProps) {
  const asunto = `${DOCUMENT.asuntoPrefijo} ${tableLabel.toLowerCase()} · ${DOCUMENT.periodo}`;

  return (
    <SectionCard
      number="02"
      title="Documento, fecha y asunto"
      subtitle="Control administrativo del reporte"
    >
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-[2fr_1fr]">
        <Field label="Número de documento" value={DOCUMENT.numero} icon={<Hash className="size-4" />} />
        <Field
          label="Fecha de emisión"
          value={formatDate(DOCUMENT.fechaEmision)}
          icon={<CalendarDays className="size-4" />}
        />
      </div>
      <div className="px-5 pb-5">
        <Field label="Asunto" value={asunto} />
      </div>
    </SectionCard>
  );
}
