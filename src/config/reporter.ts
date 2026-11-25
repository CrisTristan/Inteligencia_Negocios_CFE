/**
 * Contenido fijo de la vista /reporter.
 *
 * Aquí están los textos que hoy no viven en la base de datos (identidad del
 * departamento, folios, responsables, notas...). Centralizarlos permite
 * cambiarlos sin tocar los componentes. Todos los datos son FICTICIOS
 * (prototipo académico; ver README.md).
 */
import type { TableName } from "@/types/reporter";

/** Fecha de corte de los datos ficticios del seed (formato ISO). */
export const FECHA_CORTE = "2026-11-20";

/** Registros por página en la previsualización (sección 04). */
export const PAGE_SIZE = 12;

/** Tabla que se muestra cuando la URL no indica una (o indica una inválida). */
export const DEFAULT_TABLE: TableName = "equipo";

/**
 * Catálogo de tablas consultables = LISTA BLANCA.
 * Solo los nombres que aparecen aquí pueden llegar a una consulta SQL, por lo
 * que un valor arbitrario en `?tabla=` nunca se interpola en el SQL.
 */
export const TABLE_CATALOG: Record<
  TableName,
  {
    label: string;
    description: string;
    /**
     * Columnas que se muestran en el reporte cuando otra tabla hace
     * referencia a esta por llave foránea (en lugar del ID numérico).
     */
    displayColumns: string[];
  }
> = {
  equipo: { label: "Equipos", description: "Inventario de activos", displayColumns: ["num_economico"] },
  mantenimiento: {
    label: "Mantenimientos",
    description: "Historial de intervenciones",
    displayColumns: ["tipo_mantenimiento", "fecha_programada"],
  },
  tipo_equipo: { label: "Tipos de equipo", description: "Catálogo", displayColumns: ["nombre_tipo"] },
  marca: { label: "Marcas", description: "Catálogo", displayColumns: ["nombre_marca"] },
  ubicacion: {
    label: "Ubicaciones",
    description: "Subestaciones y circuitos",
    displayColumns: ["subestacion", "circuito"],
  },
  estado_operativo: { label: "Estados operativos", description: "Catálogo", displayColumns: ["nombre_estado"] },
  trabajador: { label: "Trabajadores", description: "Personal técnico", displayColumns: ["nombre"] },
};

/** Barra de aplicación y encabezado de página. */
export const APP = {
  name: "SIGIAM-CC",
  module: "Reporteador de control y comunicaciones",
  connection: "PostgreSQL · sigiam_cc",
  user: "R. Chi Balam · Jefa de Oficina",
  breadcrumb: "Reportes / Nuevo reporte",
  title: "Constructor de reportes de inventario y mantenimiento",
  draftStatus: "Borrador guardado · hace 1 min",
};

/** Sección 01 · Datos de la empresa / departamento. */
export const COMPANY = {
  empresa: "Comisión Federal de Electricidad",
  clave: "CFE-DCC-01",
  departamento: "Control y Comunicaciones",
  zona: "Cancún · Riviera Maya",
};

/** Sección 02 · Documento, fecha y asunto (el asunto depende de la tabla). */
export const DOCUMENT = {
  numero: "RPT-CYC-2026-0001",
  fechaEmision: FECHA_CORTE,
  asuntoPrefijo: "Concentrado de",
  periodo: "noviembre 2026",
};

/** Sección 06 · Validación del reporte. */
export const VALIDATION = {
  estatus: "Pendiente de firma",
  instruccion:
    "Este reporte deberá validarse por la Jefatura del Departamento de Control y Comunicaciones antes de su distribución.",
  folio: "VAL-2026-11-001",
  selloTexto: "CFE · Control y Comunicaciones",
  selloAnio: "2026",
  firmaNombre: "Rosa Elena Chi Balam",
  firmaCargo: "Jefa de Oficina · Firma de validación",
};

/** Sección 07 · Notas, distribución y responsables. */
export const NOTES = {
  notas:
    "Las cifras corresponden a los registros del Departamento de Control y Comunicaciones con fecha de corte al 20 de noviembre de 2026. Datos ficticios con fines académicos.",
  maxCaracteres: 300,
  ccp: ["Jefatura de Zona", "Subgerencia de Distribución", "Archivo del departamento"],
  envio: { nombre: "Rosa Elena Chi Balam", cargo: "Jefa de Oficina" },
  elaboro: { nombre: "Luis Alberto Canché Pool", cargo: "Ingeniero de Control" },
  trazabilidad: "Generado el 20/11/2026 a las 10:42 · versión 1.0",
};
