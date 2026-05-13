# Metodología de conteos — Helios

## Objetivo

Unificar criterios para interpretar cifras mostradas en **Helios** (`ms-helios-frontend` + `ms-backend-helios-bigquery`) frente a fuentes públicas (p. ej. datos.gov.co — SECOP II).

## Vista principal: `silver_zone.vw_contratos_electronicos`

- **Proyecto / dataset:** `mdn-transparencia-prd.silver_zone` (configurable por variables de entorno).
- **Unidad de conteo por defecto:** `COUNT(*)` sobre filas de la vista salvo que se indique `COUNT(DISTINCT id_contrato)`.
- **Implicación:** si la vista incluye **una fila por versión o modificación** del mismo contrato, los totales de Helios pueden ser **mayores** que los conteos únicos publicados en el portal de datos abiertos.

## Roles en investigación

Para un mismo NIT pueden calcularse, en paralelo:

1. Filas donde `documento_proveedor` coincide (rol **proveedor**).
2. Filas donde `nit_entidad` coincide (rol **entidad contratante**).

La **suma de roles** no deduplica un mismo `id_contrato` entre roles distintos (un contrato no adjudica al mismo NIT como proveedor y entidad a la vez), pero **sí puede inflar** respecto a un solo rol si se compara solo con "contratos como proveedor" en SECOP.

## Consulta IA

- El modelo genera SQL; el backend adjunta `_meta` con `sql_executed` y `sql_graph`.
- Se recomienda agrupar rankings de proveedores por **`documento_proveedor`** (NIT) con `ANY_VALUE(proveedor_adjudicado)` como nombre representativo (ver prompt en `prompt-sql-generator.md`).

## Alertas

- Vista/tabla configurable: `BQ_ALERTS_VIEW` (por defecto `alertas_defensa_mat`).
- Los perfiles de alerta usan esta capa materializada para coherencia y rendimiento.

## Auditoría de muestra

- Endpoint interno: `GET /bigquery/audit/sample-reconciliation`
- NITs de muestra: variable de entorno `AUDIT_SAMPLE_NITS` (lista separada por comas).

## Variables de entorno relevantes

| Variable | Descripción |
|----------|-------------|
| `STATS_GROUP_BY_NIT` | `true` (defecto): top proveedores agrupa por NIT. |
| `BQ_LOG_FULL_SQL` | `true`: registra SQL completa en logs del backend. |
| `AUDIT_SAMPLE_NITS` | NITs para auditoría de conciliación. |
