# SIGIAM-CC

**Sistema de Inteligencia para la Gestión de Inventario y Mantenimiento de Control y Comunicaciones**

Prototipo académico de Inteligencia de Negocios desarrollado para la materia de Inteligencia de Negocios en el Instituto Tecnológico de Cancún (Ingeniería en Sistemas Computacionales).

---

## Contexto

La Comisión Federal de Electricidad (CFE) presta el servicio eléctrico en el país y cuenta con distintas áreas técnicas que apoyan la operación de su infraestructura. Una de ellas es el **Departamento de Control y Comunicaciones**, que se encarga del registro, la revisión, el control y el mantenimiento de equipos como restauradores, unidades terminales remotas, radios de comunicación, switches, medidores y bancos de baterías, instalados en diferentes subestaciones.

En su trabajo diario, el departamento genera mucha información: qué equipos existen, dónde están instalados, en qué condiciones operan, qué mantenimientos se les han hecho y cuáles están pendientes.

## La problemática

Hoy esa información **no tiene un formato común de almacenamiento**. Está repartida en distintos archivos y hojas de cálculo, y cada uno se llena de forma diferente. Esto provoca que:

- Sea difícil tener una **visión general** del estado del departamento.
- Encontrar, interpretar y analizar la información **dependa en gran medida del conocimiento de las personas** que la manejan.
- Para saber cuántos equipos fallan o qué mantenimientos están atrasados haya que **revisar a mano varias hojas**.
- Los datos se repitan, no coincidan entre archivos o queden incompletos, lo que **resta confianza** a cualquier análisis.

Concentrar los registros en un solo lugar ayudaría, pero no basta: además de guardar la información, el departamento necesita **entenderla rápidamente para tomar decisiones**.

## Propósito del proyecto

SIGIAM-CC propone una solución de **Inteligencia de Negocios** que convierta los registros operativos del departamento en **información útil, ordenada y fácil de consultar**.

El objetivo general es diseñar un prototipo que permita **integrar, centralizar y analizar** la información generada por el personal del departamento, para facilitar la consulta del inventario de equipos, su estado operativo y sus mantenimientos, mediante **indicadores y tableros visuales** que apoyen la toma de decisiones.

El proyecto no busca solo digitalizar los formatos existentes. Busca **transformar los datos en conocimiento** para planear, dar seguimiento y priorizar el trabajo.

## ¿Qué preguntas ayuda a responder?

- ¿Cuántos equipos tiene registrados el departamento y de qué tipo, marca y ubicación son?
- ¿Cuántos están funcionando y cuántos presentan fallas o están fuera de servicio?
- ¿Qué mantenimientos se han realizado y cuáles siguen pendientes o vencidos?
- ¿Qué porcentaje de los mantenimientos programados se cumple?
- ¿Cómo se distribuyen los mantenimientos a lo largo del año?
- ¿Qué equipos requieren atención inmediata?
- ¿Cuál es el historial de mantenimiento de un equipo en particular?
- ¿Mejoró el desempeño de un periodo a otro?
- ¿Qué pocos equipos concentran la mayoría de las fallas y conviene atender primero?

## Enfoque dentro del Modelo de Negocios Canvas

El proyecto se centra en el **punto 7 del Canvas: Actividades clave**. Las tareas de registro, revisión, control y mantenimiento de equipos son las que generan la información que se puede aprovechar con Inteligencia de Negocios. De forma complementaria, toca el **punto 6: Recursos clave**, porque los equipos de control y comunicación y el personal técnico son la base de esas actividades.

## Alcance

El proyecto contempla:

- Analizar algunos de los formatos que se usan actualmente para controlar la información.
- Tomar el **formato de restauradores y mantenimiento** como caso de referencia.
- Identificar los datos que comparten los distintos formatos.
- Estandarizar y depurar los datos seleccionados.
- Diseñar una estructura centralizada para almacenar la información.
- Integrar la información que hoy está en hojas de cálculo.
- Permitir consultar el inventario de equipos y su estado operativo.
- Dar seguimiento a los mantenimientos realizados y pendientes.
- Generar indicadores de desempeño, tableros visuales y reportes para la toma de decisiones.

## Delimitación

- Es un **prototipo académico**: los datos que se muestran son **ficticios** y solo ilustran el funcionamiento de la propuesta.
- Se limita a la información del **Departamento de Control y Comunicaciones** y no abarca otras áreas de la CFE.
- **No sustituye** los sistemas institucionales existentes ni interactúa directamente con equipos eléctricos o de comunicaciones.
- Su enfoque es la **integración, consulta, análisis y visualización** de información.

## Beneficios esperados

- **Visión general inmediata** del estado de los equipos, sin revisar archivos uno por uno.
- **Menos dependencia** del conocimiento de una sola persona, gracias a criterios de consulta estandarizados.
- **Información más confiable**, al evitar datos duplicados, inconsistentes o incompletos.
- **Mejor priorización** del mantenimiento, enfocando los esfuerzos en los equipos que más fallan.
- **Seguimiento** del cumplimiento y comparación entre periodos para medir mejoras.

## Cómo ejecutar

Requisitos: Node.js 20+ y Docker Desktop.

```bash
cp .env.example .env.local   # cadena de conexión a PostgreSQL
docker compose up -d         # levanta PostgreSQL y carga esquema + datos (solo la 1.ª vez)
npm install
npm run dev                  # http://localhost:3000/reporter
```

- La base de datos se expone en el puerto **5433** del host para no chocar con otra instalación de PostgreSQL en el 5432.
- Para recrear la base desde cero: `docker compose down -v` y luego `docker compose up -d`.

## Estructura del proyecto

```
docker-compose.yml           Servicio de PostgreSQL 17
docker/postgres/init/        Scripts que Docker ejecuta al crear la base
  01_schema.sql              Esquema (convertido de MySQL a PostgreSQL)
  02_seed.sql                Datos ficticios
docs/                        Diseño de referencia y script original (MySQL)
src/
  app/reporter/              Vista /reporter (Server Component + Suspense)
  components/layout/         Barra de aplicación y encabezado
  components/ui/             Componentes base (tarjeta, campo, badge, botón)
  components/reporter/       Las 7 secciones del reporte
  actions/                   Server actions de escritura (crear/actualizar/borrar)
  lib/db.ts                  Conexión a PostgreSQL (Pool de pg)
  lib/queries/               Consultas de lectura
  config/                    Textos fijos del reporte
  types/                     Tipos compartidos
```

## Equipo

- Abad Mendieta Cristian
- Kantun Balam José Francisco
- Mendez Cordero Anwar Bahrain
- Pallares Vega Benjamín Alejandro

**Docente:** Lic. Enrique Alberto Trejo Guzmán
**Materia:** Inteligencia de Negocios · Instituto Tecnológico de Cancún
