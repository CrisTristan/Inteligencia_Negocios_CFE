import { CircleCheck } from "lucide-react";
import { APP } from "@/config/reporter";

/** Ruta de navegación, título de la página y estado del borrador. */
export function PageHeader() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
          {APP.breadcrumb}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{APP.title}</h1>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-slate-500">
        <CircleCheck className="size-3.5 text-emerald-600" aria-hidden />
        {APP.draftStatus}
      </p>
    </div>
  );
}
