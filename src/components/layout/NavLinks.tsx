"use client";
/** Enlaces entre las vistas de la app; marca la ruta activa. */
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/reporter", label: "Reporteador" },
  { href: "/charts", label: "Gráficas" },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Vistas" className="flex items-center gap-1">
      {LINKS.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
