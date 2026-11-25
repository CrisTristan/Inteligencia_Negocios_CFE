import { Copy, History } from "lucide-react";
import { SectionCard } from "@/components/ui/SectionCard";
import { NOTES } from "@/config/reporter";
import { initials } from "@/lib/format";

/** Sección 07 · Observaciones, destinatarios (c.c.p.) y trazabilidad. */
export function NotesSection() {
  return (
    <SectionCard
      number="07"
      title="Notas, distribución y responsables"
      subtitle="C.c.p., envío y elaboración del reporte"
    >
      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[2fr_1fr]">
        {/* Notas y copias */}
        <div>
          <div className="mb-1.5 flex justify-between text-[11px]">
            <span className="font-semibold uppercase text-slate-600">Notas</span>
            <span className="text-slate-400">
              {NOTES.notas.length} / {NOTES.maxCaracteres}
            </span>
          </div>
          <p className="min-h-24 rounded-md border border-slate-300 px-3 py-2.5 text-sm text-slate-700">
            {NOTES.notas}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Copy className="size-3.5 text-primary" aria-hidden />
            <span className="font-bold text-primary">C.c.p.</span>
            {NOTES.ccp.join(" · ")}
          </p>
        </div>

        {/* Responsables */}
        <div className="space-y-2.5">
          <Person role="Envió" {...NOTES.envio} />
          <Person role="Elaboró" {...NOTES.elaboro} />
          <p className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400">
            <History className="size-3" aria-hidden /> {NOTES.trazabilidad}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

/** Tarjeta de responsable con círculo de iniciales. */
function Person({ role, nombre, cargo }: { role: string; nombre: string; cargo: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-50 text-xs font-bold text-primary">
        {initials(nombre)}
      </span>
      <div className="leading-tight">
        <p className="text-[10px] font-semibold uppercase text-slate-400">{role}</p>
        <p className="text-sm font-bold text-slate-900">{nombre}</p>
        <p className="text-xs text-slate-500">{cargo}</p>
      </div>
    </div>
  );
}
