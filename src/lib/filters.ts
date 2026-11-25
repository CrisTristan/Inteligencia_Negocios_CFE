/**
 * Reglas de los filtros de la sección 03, compartidas por el formulario
 * (cliente) y la capa de datos (servidor). Funciones puras, sin acceso a la
 * base: el SQL se arma en src/lib/queries/reporter.ts.
 */
import { formatDate } from "@/lib/format";
import type { FilterOp, ReporterFilter } from "@/types/reporter";

export interface OperatorOption {
  op: FilterOp;
  label: string;
}

const TEXT_OPERATORS: OperatorOption[] = [
  { op: "contiene", label: "contiene" },
  { op: "igual", label: "igual a" },
  { op: "distinto", label: "distinto de" },
  { op: "empieza", label: "empieza con" },
  { op: "vacio", label: "está vacío" },
  { op: "no_vacio", label: "no está vacío" },
];

const NUMBER_OPERATORS: OperatorOption[] = [
  { op: "igual", label: "igual a (=)" },
  { op: "distinto", label: "distinto de (≠)" },
  { op: "mayor", label: "mayor que (>)" },
  { op: "mayor_igual", label: "mayor o igual (≥)" },
  { op: "menor", label: "menor que (<)" },
  { op: "menor_igual", label: "menor o igual (≤)" },
  { op: "entre", label: "entre" },
  { op: "vacio", label: "está vacío" },
  { op: "no_vacio", label: "no está vacío" },
];

const DATE_OPERATORS: OperatorOption[] = [
  { op: "igual", label: "igual a" },
  { op: "menor", label: "antes de" },
  { op: "mayor", label: "después de" },
  { op: "entre", label: "entre" },
  { op: "vacio", label: "está vacía" },
  { op: "no_vacio", label: "no está vacía" },
];

/** Clase de dato de un campo según la etiqueta que da getColumns(). */
export type ValueKind = "text" | "number" | "date";

export function kindOf(columnType: string): ValueKind {
  if (columnType === "fecha") return "date";
  if (columnType === "entero" || columnType === "relación") return "number";
  return "text";
}

/** Operadores permitidos para un tipo de columna. */
export function operatorsFor(columnType: string): OperatorOption[] {
  const kind = kindOf(columnType);
  if (kind === "date") return DATE_OPERATORS;
  if (kind === "number") return NUMBER_OPERATORS;
  return TEXT_OPERATORS;
}

/** Atributo `type` del <input> del valor. */
export function inputTypeFor(columnType: string): "text" | "number" | "date" {
  return kindOf(columnType);
}

export function opNeedsValue(op: FilterOp): boolean {
  return op !== "vacio" && op !== "no_vacio";
}

export function opNeedsTwoValues(op: FilterOp): boolean {
  return op === "entre";
}

/** Valida un valor según el tipo de dato del campo. */
export function isValidValue(columnType: string, value: string): boolean {
  const kind = kindOf(columnType);
  if (kind === "number") return /^-?\d{1,9}$/.test(value);
  if (kind === "date") return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
  return value.trim().length > 0 && value.length <= 200;
}

/** Indica si un filtro está completo y es válido para el tipo de su campo. */
export function isCompleteFilter(filter: ReporterFilter, columnType: string): boolean {
  if (!operatorsFor(columnType).some((o) => o.op === filter.op)) return false;
  if (!opNeedsValue(filter.op)) return true;
  if (!isValidValue(columnType, filter.value)) return false;
  return !opNeedsTwoValues(filter.op) || isValidValue(columnType, filter.value2);
}

/** Texto legible de un filtro: "fecha_instalacion entre 01/01/2025 y 20/11/2026". */
export function describeFilter(filter: ReporterFilter, columnType: string): string {
  const option = operatorsFor(columnType).find((o) => o.op === filter.op);
  // Sin el símbolo entre paréntesis para que la frase quede limpia.
  const label = (option?.label ?? filter.op).replace(/\s*\(.*\)$/, "");
  const show = (v: string) => (kindOf(columnType) === "date" ? formatDate(v) : kindOf(columnType) === "text" ? `"${v}"` : v);

  if (!opNeedsValue(filter.op)) return `${filter.field} ${label}`;
  if (opNeedsTwoValues(filter.op)) {
    return `${filter.field} ${label} ${show(filter.value)} y ${show(filter.value2)}`;
  }
  return `${filter.field} ${label} ${show(filter.value)}`;
}
