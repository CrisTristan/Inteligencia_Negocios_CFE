"use client";
/**
 * Botón para alternar entre modo claro y oscuro.
 *
 * - El tema vive en el atributo data-theme de <html> y se guarda en
 *   localStorage ("theme"). El script en línea de layout.tsx lo aplica antes
 *   del primer pintado, así no hay parpadeo al recargar.
 * - No usa estado de React: el ícono (sol/luna) se elige con CSS según el
 *   tema activo, por lo que el HTML del servidor y del cliente es idéntico.
 */
import { useLayoutEffect } from "react";
import { Moon, Sun } from "lucide-react";

export const THEME_STORAGE_KEY = "theme";

export function ThemeToggle() {
  // En desarrollo, el Strict Mode de React vuelve a montar <html> y borra el
  // atributo que puso el script; aquí se vuelve a aplicar. En producción no
  // cambia nada.
  useLayoutEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) document.documentElement.setAttribute("data-theme", saved);
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage no disponible (modo privado): el cambio dura solo esta visita.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Cambiar entre modo claro y oscuro"
      title="Modo claro / oscuro"
      className="grid size-8 place-items-center rounded-full bg-white/10 text-white/90 transition-colors hover:bg-white/20"
    >
      {/* Tema claro: muestra la luna (pasar a oscuro). Tema oscuro: el sol. */}
      <Moon className="size-4 dark:hidden" aria-hidden />
      <Sun className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
