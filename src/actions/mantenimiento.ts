"use server";
/**
 * Server actions de ESCRITURA para la tabla `mantenimiento`.
 *
 * Convención del proyecto:
 *   - Lecturas  -> src/lib/queries (las llaman los Server Components).
 *   - Escrituras -> src/actions (crear, actualizar, borrar).
 *
 * Todas usan consultas parametrizadas ($1, $2, ...) y, al terminar, llaman a
 * revalidatePath('/reporter') para que la vista muestre los datos nuevos.
 * Las reglas de negocio (estatus vs. fecha_realizada, valores permitidos)
 * ya las garantizan los CHECK de la base de datos (01_schema.sql).
 *
 * Aún no hay ningún formulario conectado: se pueden usar así:
 *   <form action={crearMantenimiento}> ... </form>
 */
import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";

/** Lee un campo de texto del formulario; las cadenas vacías se guardan como NULL. */
function field(formData: FormData, name: string): string | null {
  const value = formData.get(name);
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

/** Crea un mantenimiento (por defecto queda "Pendiente"). */
export async function crearMantenimiento(formData: FormData): Promise<void> {
  await query(
    `INSERT INTO mantenimiento
       (id_equipo, id_trabajador, tipo_mantenimiento, fecha_programada, observaciones)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      Number(field(formData, "id_equipo")),
      Number(field(formData, "id_trabajador")),
      field(formData, "tipo_mantenimiento"), // 'Preventivo' | 'Correctivo'
      field(formData, "fecha_programada"), // 'YYYY-MM-DD'
      field(formData, "observaciones"),
    ],
  );
  revalidatePath("/reporter");
}

/**
 * Actualiza el resultado de un mantenimiento: estatus, fecha en que se
 * realizó, condición encontrada y observaciones.
 * Se usa con `.bind`: <form action={actualizarMantenimiento.bind(null, id)}>
 */
export async function actualizarMantenimiento(
  id: number,
  formData: FormData,
): Promise<void> {
  await query(
    `UPDATE mantenimiento
        SET estatus = $1,
            fecha_realizada = $2,
            condicion_encontrada = $3,
            observaciones = $4
      WHERE id_mantenimiento = $5`,
    [
      field(formData, "estatus"), // 'Realizado' | 'Pendiente'
      field(formData, "fecha_realizada"),
      field(formData, "condicion_encontrada"), // 'Buena' | 'Regular' | 'Mala'
      field(formData, "observaciones"),
      id,
    ],
  );
  revalidatePath("/reporter");
}

/** Borra un mantenimiento por su id. */
export async function borrarMantenimiento(id: number): Promise<void> {
  await query(`DELETE FROM mantenimiento WHERE id_mantenimiento = $1`, [id]);
  revalidatePath("/reporter");
}
