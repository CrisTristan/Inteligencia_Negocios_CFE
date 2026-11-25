import { MapPin } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { Field } from "@/components/ui/Field";
import { COMPANY } from "@/config/reporter";

/** Sección 01 · Identidad que aparece en el encabezado impreso del reporte. */
export function CompanySection() {
  return (
    <SectionCard
      number="01"
      title="Datos de la empresa / departamento"
      subtitle="Identidad que aparecerá en el encabezado impreso"
    >
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-[2.5fr_1fr]">
        <Field label="Empresa" value={COMPANY.empresa} />
        <Field label="Clave" value={COMPANY.clave} />
      </div>
      <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2">
        <Field label="Departamento" value={COMPANY.departamento} />
        <Field label="Zona" value={COMPANY.zona} icon={<MapPin className="size-4" />} />
      </div>
    </SectionCard>
  );
}
