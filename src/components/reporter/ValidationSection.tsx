import { Building2, ShieldCheck } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { Badge } from "@/components/ui/Badge";
import { VALIDATION } from "@/config/reporter";

/** Sección 06 · Estatus, sello institucional y firma de autorización. */
export function ValidationSection() {
  return (
    <SectionCard
      number="06"
      title="Validación del reporte"
      subtitle="Sello y firma de autorización administrativa"
    >
      <div className="grid grid-cols-1 items-center gap-8 px-8 py-8 md:grid-cols-[1.1fr_0.9fr_2fr]">
        {/* Estatus de validación */}
        <div className="space-y-3">
          <Badge tone="warning">{VALIDATION.estatus}</Badge>
          <p className="text-sm text-slate-600">{VALIDATION.instruccion}</p>
          <p className="flex items-center gap-2 font-mono text-xs font-bold text-primary">
            <ShieldCheck className="size-4" aria-hidden /> {VALIDATION.folio}
          </p>
        </div>

        {/* Sello institucional: doble círculo (borde sólido + borde punteado) */}
        <div className="flex justify-center">
          <div className="grid size-32 place-items-center rounded-full border-[3px] border-primary/80 p-1.5">
            <div className="flex size-full flex-col items-center justify-center rounded-full border border-dashed border-primary/60 text-center text-primary">
              <Building2 className="size-5" aria-hidden />
              <p className="mt-1 text-xs font-extrabold uppercase">Validado</p>
              <p className="px-3 text-[9px] leading-tight uppercase">{VALIDATION.selloTexto}</p>
              <p className="mt-0.5 text-[9px] font-semibold">{VALIDATION.selloAnio}</p>
            </div>
          </div>
        </div>

        {/* Firma de autorización */}
        <div className="mx-auto w-full max-w-sm text-center">
          <p className="font-signature text-3xl text-slate-700 italic">{VALIDATION.firmaNombre}</p>
          <hr className="my-3 border-slate-300" />
          <p className="text-sm font-bold text-slate-900">{VALIDATION.firmaNombre}</p>
          <p className="text-xs text-slate-500">{VALIDATION.firmaCargo}</p>
        </div>
      </div>
    </SectionCard>
  );
}
