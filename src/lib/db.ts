/**
 * Conexión a PostgreSQL (contenedor definido en docker-compose.yml).
 *
 * - Usa un Pool de `pg`: mantiene varias conexiones abiertas y las reutiliza
 *   entre peticiones, en vez de abrir una conexión nueva por consulta.
 * - `server-only` provoca un error de compilación si este archivo se importa
 *   desde un Client Component, así las credenciales nunca llegan al navegador.
 */
import "server-only";
import { Pool, types, type QueryResultRow } from "pg";

/**
 * Por defecto `pg` convierte las columnas DATE (OID 1082) en objetos Date con
 * hora local, lo que puede recorrer el día según la zona horaria. Se piden
 * como texto plano "YYYY-MM-DD" y se formatean al mostrarlas.
 */
types.setTypeParser(1082, (value) => value);

/**
 * En desarrollo, el hot reload de Next.js vuelve a evaluar los módulos en
 * cada cambio. Si creáramos el Pool directamente, se abriría uno nuevo en
 * cada recarga hasta agotar las conexiones de PostgreSQL. Por eso se guarda
 * una única instancia en `globalThis`, que sobrevive a las recargas.
 */
const globalForDb = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForDb.pgPool ??
  new Pool({
    // Ejemplo: postgresql://sigiam:sigiam@localhost:5432/sigiam_cc (.env.local)
    connectionString: process.env.DATABASE_URL,
    max: 10, // conexiones simultáneas como máximo
  });

if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

/**
 * Ejecuta una consulta SQL parametrizada y devuelve solo las filas.
 *
 * Siempre pasa los valores en `params` ($1, $2, ...) y nunca los concatenes
 * en el texto SQL: `pg` los envía por separado, lo que evita la inyección SQL.
 *
 * @example
 *   const equipos = await query<{ id_equipo: number }>(
 *     "SELECT id_equipo FROM equipo WHERE id_estado = $1",
 *     [2],
 *   );
 */
export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  return result.rows;
}
