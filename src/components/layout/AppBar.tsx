import { Database } from "lucide-react";
import { APP } from "@/config/reporter";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

/** Barra superior oscura: marca, conexión activa y usuario en sesión. */
export function AppBar() {
  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-8">
        {/* Marca y módulo */}
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-lg bg-primary">
            <Database className="size-5" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">{APP.name}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/60">{APP.module}</p>
          </div>
        </div>

        {/* Conexión y usuario */}
        <div className="flex items-center gap-5 text-xs">
          <span className="hidden items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 font-medium sm:flex">
            <span className="size-2 rounded-full bg-emerald-400" aria-hidden />
            {APP.connection}
          </span>
          <span className="text-white/80">{APP.user}</span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
