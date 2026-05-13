# Glosario — Datos en Helios

## ¿Qué es un "contrato" en Helios?

En la mayoría de pantallas, Helios cuenta **filas** en la vista BigQuery `silver_zone.vw_contratos_electronicos` (contratos SECOP II y materializaciones relacionadas). Una misma referencia lógica puede aparecer **más de una vez** si existen modificaciones, adiciones o versiones en la fuente analítica.

## ¿Por qué cambia el número entre módulos?

- **Búsqueda de contratos** y **estadísticas**: agregaciones SQL directas sobre `vw_contratos_electronicos` (y catálogo `Nits_defensa_vf` cuando aplica fuerza).
- **Investigación**: varias consultas por rol (proveedor, entidad contratante, representante legal, ordenador del gasto). La tarjeta "Estadísticas" del análisis con IA puede **sumar roles**; use el bloque **Desglose por rol (SQL)** para ver cada total por separado.
- **Consulta IA**: Gemini genera SQL; los resultados son determinísticos **después** de ejecutar la consulta, pero la consulta en sí puede variar si se reformula la pregunta.
- **Alertas / perfiles**: suelen basarse en la tabla materializada `alertas_defensa_mat` (definida por `BQ_ALERTS_VIEW`), con reglas de alerta precomputadas.

## Metadatos `creation_time` (BigQuery)

El campo "Última actualización" mostrado en el chip de procedencia proviene de `INFORMATION_SCHEMA.TABLES.creation_time` en BigQuery: refleja **metadatos del objeto en BigQuery**, no necesariamente la fecha de carga del dato de negocio en SECOP.

## Fuentes públicas de referencia

- SECOP II Contratos electrónicos (datos.gov.co)
- SECOP II Procesos (datos.gov.co)

Helios **no** consulta datos.gov.co en tiempo real; la validación externa es manual.

## Modo experto

Activa etiquetas técnicas adicionales (por ejemplo, botón "Ver SQL" en secciones de investigación). El modo se guarda en el navegador (`localStorage`).
