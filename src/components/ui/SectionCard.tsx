import type { ReactNode } from "react";

interface SectionCardProps {
  /** Número de sección que aparece en el badge oscuro: "01", "02", ... */
  number: string;
  title: string;
  subtitle: string;
  /** Contenido opcional a la derecha del encabezado (p. ej. "Expandido"). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Tarjeta base de cada sección del reporte: encabezado gris con badge
 * numerado, título y subtítulo, y el contenido debajo.
 */
export function SectionCard({
  number,
  title,
  subtitle,
  aside,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-xl border border-line bg-surface ${className}`}
    >
      <header className="flex items-center gap-3 border-b border-line bg-slate-50/70 px-5 py-3.5">
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary font-mono text-[11px] font-bold text-white">
          {number}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}
