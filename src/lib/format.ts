/**
 * Utilidades de formato para mostrar los datos en la vista.
 * Funciones puras: se pueden usar en servidor o cliente.
 */

/** "2026-11-20" -> "20/11/2026". Si no es una fecha ISO, la devuelve igual. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** Meses abreviados en español. */
export const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

/** "2025-01" -> "Ene 25". */
export function monthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split("-");
  return `${MONTHS_SHORT[Number(m) - 1] ?? m} ${y.slice(-2)}`;
}

/** "2026-11-20" -> "20 nov 2026". */
export function formatDateMedium(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${(MONTHS_SHORT[Number(m) - 1] ?? m).toLowerCase()} ${y}`;
}

/** 1234.5 -> "1,234.5" (formato es-MX). */
export function formatNumber(value: number): string {
  return value.toLocaleString("es-MX");
}

/** Iniciales de un nombre: "Rosa Elena Chi Balam" -> "RC". */
export function initials(fullName: string): string {
  const parts = fullName.split(" ").filter(Boolean);
  return `${parts[0]?.[0] ?? ""}${parts[2]?.[0] ?? parts[1]?.[0] ?? ""}`.toUpperCase();
}
