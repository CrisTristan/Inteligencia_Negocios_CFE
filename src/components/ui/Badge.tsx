import type { ReactNode } from "react";

/** Variantes de color de las etiquetas de estado del diseño. */
const TONES = {
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300", // "Consulta válida", "Vista actualizada"
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300", // "Pendiente de firma"
  neutral: "bg-slate-100 text-slate-600", // "Seleccionada"
} as const;

interface BadgeProps {
  tone?: keyof typeof TONES;
  children: ReactNode;
}

/** Etiqueta pequeña en mayúsculas con fondo suave. */
export function Badge({ tone = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
