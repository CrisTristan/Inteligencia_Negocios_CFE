import type { ButtonHTMLAttributes } from "react";

/** Variantes visuales de los botones del diseño. */
const VARIANTS = {
  primary: "bg-primary text-white hover:bg-primary/90", // Generar reporte, Exportar PDF, A-Z activo
  soft: "border border-primary/20 bg-primary-50 text-primary hover:bg-primary-50/70 dark:text-sky-300", // Agregar filtro, Exportar XLSX
  outline: "border border-slate-300 bg-surface text-slate-700 hover:bg-slate-50", // Imprimir, Limpiar, Z-A
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
}

/**
 * Botón con los estilos del diseño. Acepta todos los atributos de <button>
 * (type, name, value, disabled...), lo que permite usarlo como botón de
 * envío de un formulario.
 */
export function Button({
  variant = "outline",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md px-3.5 text-xs font-semibold transition-colors disabled:pointer-events-none disabled:border-transparent disabled:bg-slate-100 disabled:text-slate-400 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
