import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  value: string;
  /** Ícono opcional dentro del campo, a la izquierda del valor. */
  icon?: ReactNode;
  className?: string;
}

/**
 * Campo de solo lectura con etiqueta en mayúsculas (secciones 01 y 02).
 * Se ve como un input, pero por ahora solo muestra el valor.
 */
export function Field({ label, value, icon, className = "" }: FieldProps) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
        {label}
      </span>
      <div className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-surface px-3 text-sm text-slate-800">
        {icon && <span className="text-slate-500">{icon}</span>}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}
