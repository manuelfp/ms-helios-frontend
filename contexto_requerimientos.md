# Sistema Helios — Contexto, Requerimientos y Plan de Implementación

## 1. Contexto

### 1.1 Marco Institucional

El **Sistema de Información Helios** es una herramienta analítica del **Ministerio de Defensa Nacional de Colombia** cuyo objetivo es realizar seguimiento sistémico a la contratación pública del Sector Defensa e implementar modelos de detección de anomalías, alertas tempranas y análisis de riesgos de corrupción.

**Normatividad aplicable:**

| Tipo | Referencia |
|------|-----------|
| Decreto | Decreto 1600 de 2024 — Estrategia Nacional de Lucha Contra la Corrupción |
| Resolución | Resolución 1609 de 2026 — Creación del Grupo de Transparencia del Despacho del MDN |
| Memorando | 20250528006765 — Plan de Choque 2025 del Señor Ministro de Defensa Nacional |
| Guía Internacional | OCP (2024). "Red flags in public procurement: A guide to using data to detect and mitigate risks" |
| Metodología Interna | Propuesta Metodológica: Sistema de Alertas Tempranas de Contratación del Sector Defensa v2 |

**Objetivo General (Meta Plan de Choque 2025):** "Desarrollar e implementar un Sistema de Alertas Tempranas para la Contratación del Sector Defensa que mitigue la materialización de riesgos de corrupción."

### 1.2 Público Objetivo del Sistema de Alertas

| Nivel | Usuarios |
|-------|---------|
| Estratégico | Ministro de Defensa Nacional, Grupo de Transparencia |
| Táctico | Comandantes de FF.MM., Director Policía Nacional, Representantes legales entidades Sector Defensa |
| Operativo | Oficinas de integridad y transparencia del Sector Defensa |
| Externo | Otras entidades del sector público, entes de control |

### 1.3 Fuentes de Datos

| Fuente | Descripción | Volumen |
|--------|------------|---------|
| **SECOP II — Contratos Electrónicos** (Principal) | datos.gov.co — jbjy-vk9h | 5.59M filas × 84 columnas |
| **SECOP II — Procesos de Contratación** (Secundaria) | datos.gov.co — p6dx-8zbt | 9.19M filas × 59 columnas |
| **Base Unificada** (resultado del merge) | Merge many-to-one por `proceso_de_compra` ↔ `id_del_portafolio` | ~5.59M filas × 129 columnas |

> **Nota:** La base unificada requiere un proceso ETL de estandarización (NITs sin puntos/comas, strings en mayúsculas, valores decimales con punto, eliminación de duplicados, exclusión de contratos en estado "Borrador" y "En aprobación").

### 1.4 Concepto de Bandera Roja (Red Flag)

Según OCP (2024): *"Indicadores que pueden ayudar a detectar posibles riesgos de irregularidades, corrupción y malas prácticas a lo largo de toda la cadena de un proceso de contratación. Aunque estos indicadores no demuestran necesariamente la presencia de corrupción, pueden considerarse buenas medidas para señalar riesgos de corrupción y pueden correlacionarse con prácticas corruptas."*

---

## 2. Requerimientos Funcionales

### 2.1 Alertas Tempranas (Propuesta Metodológica MDN v2)

Se requiere implementar **7 tipos de alertas tempranas** definidas en la propuesta metodológica, cada una con su cálculo estadístico específico:

#### AT-01: Procesos de Selección con Único Oferente
- **Referencia OCP:** R018 — Single bid received
- **Objetivo:** Identificar falta de competencia en licitaciones abiertas
- **Unidad de análisis:** Contrato (`id_contrato`)
- **Lógica:**
  1. Filtrar contratos cuya `modalidad_de_contratacion` ∈ {"Contratación Abierta", "Selección Abreviada", "Mínima Cuantía", "Concurso de Méritos"} (o ≠ "Contratación directa" y "Contratación régimen especial")
  2. De esos, seleccionar los que tengan `proveedores_unicos_con` = 1
  3. Crear variable binaria (1 = alerta activa, 0 = sin alerta)
- **Producto:** Listado de contratos marcados
- **Campos requeridos:** `id_contrato`, `modalidad_de_contratacion`, `proveedores_unicos_con`
- **Datos faltantes:** El campo `proveedores_unicos_con` proviene de la **base secundaria** (Procesos de Contratación). Se requiere verificar su disponibilidad en BigQuery tras el merge de bases.

#### AT-02: Periodo de Adjudicación Extremadamente Corto
- **Referencia OCP:** R061 — Decision period extremely short
- **Objetivo:** Evidenciar adjudicaciones atípicamente rápidas que sugieran favoritismo
- **Unidad de análisis:** Contrato (`id_contrato`)
- **Lógica:**
  1. Agrupar contratos por `modalidad_de_contratacion` (conjunto *m*)
  2. Calcular delta: `fecha_adjudicacion` − `fecha_de_apertura_efectiva` para cada contrato
  3. Calcular Q1, Q3 y RQ (rango intercuartil) por modalidad
  4. Determinar periodo mínimo: `periodo_m = Q1 − 1.5 × RQ_m`
  5. Marcar contratos cuyo delta ≤ `periodo_m`
- **Producto:** Listado de contratos marcados por modalidad
- **Campos requeridos:** `id_contrato`, `modalidad_de_contratacion`, `fecha_adjudicacion`, `fecha_de_apertura_efectiva`
- **Datos faltantes:** `fecha_adjudicacion` y `fecha_de_apertura_efectiva` provienen de la **base secundaria**. Verificar disponibilidad post-merge en BigQuery.

#### AT-03: Casos Atípicos de Participación de Proveedores en Entidades
- **Referencia OCP:** R040 — High share of buyer's contracts
- **Objetivo:** Identificar concentración inusual proveedor-entidad
- **Unidad de análisis:** Proveedor × Entidad
- **Lógica:**
  1. Agrupar datos por entidad *b* del Sector Defensa para periodo *t* (últimos 3 años)
  2. Calcular participación: `S(k,b,t) = Σ valor_contratos_adjudicados(k,b,t) / Σ valor_total_contratos(b,t)`
  3. Calcular umbral: `Q3 + 1.5 × RQ` por entidad (o umbral fijo del 40%)
  4. Marcar proveedores cuya participación S ≥ umbral
- **Producto:** Listado de proveedores con concentración anómala por entidad
- **Campos requeridos:** `codigo_proveedor`, `proveedor_adjudicado`, `nombre_entidad`, `valor_del_contrato`, `fecha_de_firma`

#### AT-04: Casos Atípicos de Participación de Proveedores en Ciudades
- **Referencia OCP:** R040 — High share of buyer's contracts
- **Objetivo:** Identificar concentración inusual proveedor-ciudad
- **Unidad de análisis:** Proveedor × Ciudad
- **Lógica:** Idéntica a AT-03 pero agrupando por `ciudad` en vez de entidad
- **Producto:** Listado de proveedores con concentración anómala por ciudad
- **Campos requeridos:** `codigo_proveedor`, `proveedor_adjudicado`, `ciudad`, `valor_del_contrato`, `fecha_de_firma`

#### AT-05: Casos Atípicos de Participación de Proveedores en Mercados (UNSPSC)
- **Referencia OCP:** R050 — High market share
- **Objetivo:** Identificar concentración en mercados UNSPSC (Segment, 2 primeros dígitos)
- **Unidad de análisis:** Proveedor × Mercado (categoría UNSPSC segment)
- **Lógica:** Idéntica a AT-03/AT-04 pero agrupando por los 2 primeros dígitos de `codigo_de_categoria_principal`
- **Producto:** Listado de proveedores con concentración anómala por mercado UNSPSC
- **Campos requeridos:** `codigo_proveedor`, `proveedor_adjudicado`, `codigo_de_categoria_principal`, `valor_del_contrato`, `fecha_de_firma`

#### AT-06: Contratos que Superan su Plazo en una Anualidad
- **Referencia OCP:** R064 — Contract has modifications
- **Objetivo:** Identificar contratos cuyo plazo cruza vigencias presupuestales por adiciones
- **Unidad de análisis:** Contrato (`id_contrato`)
- **Lógica:**
  1. Filtrar contratos con `dias_adicionados` ≥ 1
  2. Extraer año de `fecha_de_inicio_del_contrato` y `fecha_fin_del_contrato`
  3. Marcar si los años son diferentes
- **Producto:** Listado de contratos marcados
- **Campos requeridos:** `id_contrato`, `dias_adicionados`, `fecha_de_inicio_del_contrato`, `fecha_fin_del_contrato`

#### AT-07: Proveedores con Múltiples Categorías UNSPSC
- **Referencia OCP:** R048 — Heterogeneous supplier
- **Objetivo:** Detectar proveedores que operan en un número atípicamente alto de categorías
- **Unidad de análisis:** Proveedor
- **Lógica:**
  1. Agrupar contratos por `codigo_proveedor`
  2. Extraer 2 primeros dígitos de `codigo_de_categoria_principal` → `first_two_digits`
  3. Calcular `variedad_k` = número de valores únicos de segments UNSPSC por proveedor
  4. Calcular umbral: `Q3 + 1.5 × RQ` del conjunto de variedades
  5. Marcar proveedores cuya variedad ≥ umbral
- **Producto:** Listado de proveedores marcados
- **Campos requeridos:** `codigo_proveedor`, `proveedor_adjudicado`, `codigo_de_categoria_principal`

---

### 2.2 Requerimientos de Visualización Frontend

#### REQ-VIS-01: Dashboard de Alertas Tempranas
- Vista principal con resumen consolidado de las 7 alertas
- KPIs: total de alertas activas por tipo, contratos afectados, proveedores señalados, valor en riesgo
- Filtros: Año, Fuerza, Entidad, Ciudad, Modalidad
- Gráficos de distribución de alertas por tipo, por fuerza, por entidad
- Tendencia temporal de alertas

#### REQ-VIS-02: Vista Detallada por Tipo de Alerta
- Tabla de resultados con contratos/proveedores marcados
- Filtros y ordenamiento
- Exportación de resultados
- Detalle modal al hacer clic en un registro
- Explicación metodológica visible para cada alerta

#### REQ-VIS-03: Perfil de Riesgo por Proveedor
- Vista consolidada de todas las alertas asociadas a un proveedor
- Badge de nivel de riesgo (número de alertas acumuladas)
- Detalle de cada alerta activa con contexto
- Grafo de relaciones (contratos, entidades, ciudades)

#### REQ-VIS-04: Perfil de Riesgo por Entidad
- Vista consolidada de alertas por entidad
- Proveedores con alertas activas en la entidad
- Concentración de proveedores
- Distribución por modalidad y tipo de contrato

#### REQ-VIS-05: Mapa de Calor Geográfico
- Visualización por departamento/ciudad de concentración de alertas
- Drill-down de ciudad a contratos específicos

#### REQ-VIS-06: Índice de Riesgo Compuesto
- Cálculo de un score de riesgo por contrato/proveedor basado en la acumulación de banderas rojas
- Clasificación por niveles: Bajo, Medio, Alto, Crítico
- Ranking de proveedores y entidades por nivel de riesgo

---

### 2.3 Requerimientos No Funcionales

| ID | Requisito |
|----|-----------|
| RNF-01 | Los cálculos de alertas deben ejecutarse en el backend (BigQuery) para manejar el volumen de datos (~5.59M registros) |
| RNF-02 | Los resultados deben cachearse para evitar recálculos costosos en cada consulta |
| RNF-03 | El sistema debe soportar actualización incremental cuando se carguen nuevos datos SECOP |
| RNF-04 | Se requieren niveles de acceso diferenciados (estratégico, táctico, operativo) según la Propuesta Metodológica |
| RNF-05 | Los datos sensibles (nombres, documentos) deben respetar el toggle de privacidad existente |
| RNF-06 | Las visualizaciones deben ser responsive y soportar modo fullscreen |
| RNF-07 | Debe haber documentación metodológica accesible desde cada vista de alerta |

---

## 3. Análisis de Brechas: Estado Actual vs. Requerido

> **✅ VALIDACIÓN REALIZADA** contra el proyecto BigQuery `mdn-transparencia-prd` el 28 de febrero de 2026.

### 3.1 Inventario de Tablas en BigQuery

**Proyecto:** `mdn-transparencia-prd`

#### Dataset `bronze_zone` (datos crudos SECOP)

| Tabla | Descripción | Partición |
|-------|------------|-----------|
| `contratos_electronicos` | **Base Principal** — Contratos SECOP II | DAY (`created_at`), clustered by `id_contrato` |
| `procesos_contratacion` | **Base Secundaria** — Procesos SECOP II | DAY (`created_at`), clustered by `id_del_proceso` |
| `procesos_contratacion_base_unicos` | Procesos deduplicados | — |
| `proponentes_proceso` | Proponentes/oferentes por proceso | DAY (`created_at`), clustered by `nit_proveedor` |
| `multas_sanciones` | Multas y sanciones contractuales | DAY (`created_at`), clustered by `id_contrato` |
| `adiciones` | Adiciones contractuales (valor, cesión, plazo, suspensión) | DAY (`created_at`), clustered by `id_contrato` |
| `grupos_proveedores` | Composición de grupos/uniones temporales | DAY (`created_at`), clustered by `nit_participante` |
| `rues` | Registro RUES (Cámaras de Comercio) | DAY (`created_at`), clustered by `numero_identificacion` |
| `paa` | Plan Anual de Adquisiciones | DAY (`created_at`) |
| `siif` | Sistema Integrado de Información Financiera | DAY (`created_at`) |
| `GSED_DimEntidades` | Dimensión de entidades GSED | — |

#### Dataset `silver_zone` (datos procesados/unificados)

| Tabla/Vista | Descripción |
|------------|------------|
| `vw_SECOP_II` | **Vista principal unificada** — JOIN de contratos + adiciones + proponentes + multas + procesos (~160 campos) |
| `vw_contratos_electronicos` | Vista materializada de contratos (campos clave) |
| `vw_adiciones` | Vista materializada de adiciones |
| `Nits_defensa_vf` | **Tabla de clasificación Sector Defensa** (NIT → Fuerza → Descripción) |
| `nits-defensa` | Clasificación simplificada (NIT → Fuerza → `sector_defensa`) |
| `filtros_entidades_mindefensa` | Listado de entidades del MinDefensa |
| `codigos-unspc` | Catálogo UNSPSC (Segmento → Familia → Clase) |
| `segmentos` | Catálogo de segmentos UNSPSC |
| `indice_contratos` | Índice `id_del_portafolio` ↔ `id_contrato` con conteo de adiciones por tipo |
| `procesos_contratacion_unicos_nuevos` | Procesos deduplicados con campos clave |
| `procesos_contratacion_v2` | Similar con campo `rn` (row number) |
| `Proveedores_totales` | Listado de proveedores adjudicadores |
| `contratos_uniones` | Contratos asociados a uniones temporales |
| `proveedores_unicos` | Proveedores únicos consolidados |

### 3.2 Validación de Campos Requeridos por Alerta

#### Base Principal (`bronze_zone.contratos_electronicos`)

| Campo Requerido | ¿Existe? | Tipo | Observación |
|----------------|----------|------|-------------|
| `id_contrato` | ✅ **SÍ** | STRING | Clustered field |
| `nombre_entidad` | ✅ **SÍ** | STRING | |
| `nit_entidad` | ✅ **SÍ** | INTEGER | |
| `modalidad_de_contratacion` | ✅ **SÍ** | STRING | |
| `valor_del_contrato` | ✅ **SÍ** | INTEGER | |
| `codigo_proveedor` | ✅ **SÍ** | STRING | |
| `proveedor_adjudicado` | ✅ **SÍ** | STRING | |
| `documento_proveedor` | ✅ **SÍ** | STRING | |
| `ciudad` | ✅ **SÍ** | STRING | |
| `departamento` | ✅ **SÍ** | STRING | |
| `fecha_de_firma` | ✅ **SÍ** | TIMESTAMP | |
| `fecha_de_inicio_del_contrato` | ✅ **SÍ** | TIMESTAMP | Confirmado |
| `fecha_de_fin_del_contrato` | ✅ **SÍ** | TIMESTAMP | Confirmado |
| `fecha_de_inicio_de_ejecucion` | ✅ **SÍ** | TIMESTAMP | Campo adicional disponible |
| `fecha_de_fin_de_ejecucion` | ✅ **SÍ** | TIMESTAMP | Campo adicional disponible |
| `dias_adicionados` | ✅ **SÍ** | INTEGER | Confirmado |
| `codigo_de_categoria_principal` | ✅ **SÍ** | STRING | UNSPSC code, confirmado |
| `estado_contrato` | ✅ **SÍ** | STRING | |
| `proceso_de_compra` | ✅ **SÍ** | STRING | Llave para JOIN con procesos |

#### Base Secundaria (`bronze_zone.procesos_contratacion`)

| Campo Requerido | ¿Existe? | Tipo | Observación |
|----------------|----------|------|-------------|
| `proveedores_unicos_con` | ✅ **SÍ** | INTEGER | **CONFIRMADO** — Disponible directamente |
| `fecha_adjudicacion` | ✅ **SÍ** | TIMESTAMP | **CONFIRMADO** — Disponible directamente |
| `fecha_de_apertura_efectiva` | ✅ **SÍ** | TIMESTAMP | **CONFIRMADO** — Disponible directamente |
| `id_del_portafolio` | ✅ **SÍ** | STRING | Llave para JOIN con contratos |
| `modalidad_de_contratacion` | ✅ **SÍ** | STRING | |
| `proveedores_invitados` | ✅ **SÍ** | INTEGER | Dato extra útil para análisis |
| `proveedores_con_invitacion` | ✅ **SÍ** | INTEGER | Dato extra útil |
| `proveedores_que_manifestaron` | ✅ **SÍ** | INTEGER | Dato extra útil |
| `precio_base` | ✅ **SÍ** | INTEGER | Precio estimado del proceso |
| `valor_total_adjudicacion` | ✅ **SÍ** | INTEGER | Valor final adjudicado |

#### Vista Unificada (`silver_zone.vw_SECOP_II`)

| Campo | ¿Existe? | Observación |
|-------|----------|-------------|
| `proveedores_unicos_con` | ✅ **SÍ** | Ya incluido en la vista unificada |
| `fecha_adjudicacion` | ✅ **SÍ** | Ya incluido en la vista unificada |
| `fecha_de_apertura_efectiva` | ✅ **SÍ** | Ya incluido en la vista unificada |
| Campos de contratos | ✅ **SÍ** | Todos disponibles |
| Campos de adiciones | ✅ **SÍ** | Via JOIN con tabla adiciones |
| Campos de proponentes | ✅ **SÍ** | Via JOIN con tabla proponentes |
| Campos de multas | ✅ **SÍ** | Via JOIN con tabla multas/sanciones |

#### Clasificación Sector Defensa

| Recurso | ¿Existe? | Observación |
|---------|----------|-------------|
| `silver_zone.Nits_defensa_vf` | ✅ **SÍ** | Tabla con: `Nombre Entidad`, `Fuerza` (EJC, ARC, FAC, etc.), `Descripcion Fuerza`, `Nit Entidad`, `GSED` |
| `silver_zone.nits-defensa` | ✅ **SÍ** | Tabla simplificada con campo `sector_defensa` |
| `silver_zone.filtros_entidades_mindefensa` | ✅ **SÍ** | Listado de entidades |

#### Datos Complementarios (Útiles para Red Flags Adicionales)

| Recurso | ¿Existe? | Utilidad para Red Flags |
|---------|----------|----------------------|
| `bronze_zone.rues` | ✅ **SÍ** | Registro mercantil: validar existencia de proveedores (R045), estado, tipo sociedad |
| `bronze_zone.grupos_proveedores` | ✅ **SÍ** | Composición de consorcios/UT: detectar relaciones entre proponentes (R032, R033) |
| `bronze_zone.multas_sanciones` | ✅ **SÍ** | Historial de sanciones: proveedores sancionados (R046) |
| `bronze_zone.paa` | ✅ **SÍ** | Plan de adquisiciones: verificar planificación (R001, R012) |
| `silver_zone.codigos-unspc` | ✅ **SÍ** | Catálogo UNSPSC completo: Segmento, Familia, Clase |
| `silver_zone.indice_contratos` | ✅ **SÍ** | Conteo de adiciones por tipo (valor, cesión, expiración, suspensión) por contrato |

### 3.3 Resultado de Validación: Campos Faltantes

> **🟢 RESULTADO: NO HAY CAMPOS FALTANTES PARA LAS 7 ALERTAS TEMPRANAS**
>
> Todos los campos necesarios para implementar las 7 alertas tempranas de la Propuesta Metodológica v2 **existen en BigQuery**, tanto en las tablas individuales como en la vista unificada `vw_SECOP_II`.
>
> Los campos que se marcaron como "Requiere verificación" en la versión anterior del documento (`proveedores_unicos_con`, `fecha_adjudicacion`, `fecha_de_apertura_efectiva`) **están confirmados** en:
> - `bronze_zone.procesos_contratacion` (tabla individual)
> - `silver_zone.vw_SECOP_II` (vista unificada con JOINs)
> - `silver_zone.procesos_contratacion_unicos_nuevos` (tabla deduplicada)
>
> La clasificación Sector Defensa **ya existe** en `silver_zone.Nits_defensa_vf` y `silver_zone.nits-defensa`.

### 3.4 Endpoints API Faltantes

### 3.3 Endpoints API Faltantes

Los endpoints actuales de BigQuery **no incluyen** el cálculo de alertas tempranas. Se requieren **nuevos endpoints** en el backend:

| Endpoint Necesario | Método | Descripción |
|-------------------|--------|-------------|
| `/bigquery/alerts/summary` | GET | Resumen consolidado de alertas por tipo, con filtros (año, fuerza) |
| `/bigquery/alerts/single-bidder` | GET | AT-01: Listado contratos con único oferente |
| `/bigquery/alerts/short-award-period` | GET | AT-02: Contratos con periodo adjudicación atípicamente corto |
| `/bigquery/alerts/concentration-entity` | GET | AT-03: Concentración proveedor-entidad |
| `/bigquery/alerts/concentration-city` | GET | AT-04: Concentración proveedor-ciudad |
| `/bigquery/alerts/concentration-market` | GET | AT-05: Concentración proveedor-mercado UNSPSC |
| `/bigquery/alerts/annuity-exceeded` | GET | AT-06: Contratos que cruzan vigencia |
| `/bigquery/alerts/heterogeneous-supplier` | GET | AT-07: Proveedores con múltiples categorías |
| `/bigquery/alerts/risk-score` | GET | Índice de riesgo compuesto por proveedor/entidad |
| `/bigquery/alerts/provider-profile/{doc}` | GET | Perfil de riesgo consolidado de un proveedor |
| `/bigquery/alerts/entity-profile/{nit}` | GET | Perfil de riesgo consolidado de una entidad |

### 3.4 Funcionalidades Frontend Existentes vs. Nuevas

| Componente | Estado | Acción Requerida |
|-----------|--------|-----------------|
| Service Layer (`helios-api.js`) | ✅ Existe | Agregar funciones para nuevos endpoints de alertas |
| Routing (`routes/dashboard.jsx`) | ✅ Existe | Agregar rutas para nuevas vistas de alertas |
| Sidebar Navigation | ✅ Existe | Agregar sección "Alertas Tempranas" con sub-items |
| GraphViewer | ✅ Existe | Reutilizable para grafos de relaciones en alertas |
| StatCard | ✅ Existe | Reutilizable para KPIs de alertas |
| Privacy Toggle | ✅ Existe | Reutilizable para masking de datos sensibles |
| Recharts | ✅ Instalado | Reutilizable para gráficos de alertas |
| Dashboard Alertas (mock) | ⚠️ Existe sin datos reales | Reescribir con integración a API real |
| Páginas NeoDash (iframe) | ⚠️ Credenciales expuestas | **Reemplazar** por vistas nativas con API |
| Vista Alertas Concentración | 🔴 No existe nativamente | Crear nueva vista |
| Vista Perfil Riesgo Proveedor | 🔴 No existe | Crear nueva vista |
| Vista Perfil Riesgo Entidad | 🔴 No existe | Crear nueva vista |
| Vista Índice de Riesgo | 🔴 No existe | Crear nueva vista |

---

## 4. Plan de Implementación

### 4.1 Fases y Cronograma

```
Fase 0: Validación de Datos          [COMPLETADA]      ████ ✅
Fase 1: Backend — Alertas Core       [Semanas 1-3]     ████████████
Fase 2: Frontend — Dashboard Alertas  [Semanas 2-3]     ████████████  ← paralelo con Fase 1
Fase 3: Frontend — Vistas Detalladas  [Semanas 3-5]     ████████████
Fase 4: Índice de Riesgo + Perfiles   [Semanas 5-6]     ████████
Fase 5: Refinamiento y QA             [Semanas 6-7]     ████████
```

---

### FASE 0 — Validación de Datos y Viabilidad ✅ COMPLETADA

**Objetivo:** Confirmar la disponibilidad de todos los campos necesarios en BigQuery y el merge de bases.

| # | Tarea | Estado | Resultado |
|---|-------|--------|-----------|
| 0.1 | Verificar campos base secundaria: `proveedores_unicos_con`, `fecha_adjudicacion`, `fecha_de_apertura_efectiva` | ✅ **COMPLETADO** | **Todos existen** en `bronze_zone.procesos_contratacion` y en `silver_zone.vw_SECOP_II` |
| 0.2 | Verificar campos base principal: `dias_adicionados`, `fecha_de_inicio_del_contrato`, `fecha_fin_del_contrato`, `codigo_de_categoria_principal` | ✅ **COMPLETADO** | **Todos existen** en `bronze_zone.contratos_electronicos` |
| 0.3 | Validar tabla de clasificación Sector Defensa | ✅ **COMPLETADO** | **Ya existe** `silver_zone.Nits_defensa_vf` con Fuerza (EJC, ARC, FAC, etc.) y `silver_zone.nits-defensa` con `sector_defensa` |
| 0.4 | Documentar campos faltantes | ✅ **COMPLETADO** | **No hay campos faltantes** — todas las 7 alertas son implementables |

**Hallazgo clave:** La vista `silver_zone.vw_SECOP_II` (~160 campos) ya unifica contratos + procesos + adiciones + proponentes + multas, lo que facilita enormemente las consultas SQL para las alertas.

**Recursos adicionales encontrados:**
- `bronze_zone.rues` — Registro mercantil (útil para validar proveedores, R045)
- `bronze_zone.grupos_proveedores` — Composición de consorcios/UT (útil para R032, R033)
- `silver_zone.indice_contratos` — Conteo de adiciones por tipo (valor, cesión, expiración, suspensión)
- `silver_zone.codigos-unspc` — Catálogo UNSPSC completo (Segmento → Familia → Clase)
- `bronze_zone.paa` — Plan Anual de Adquisiciones (útil para R001, R012)

**⚠️ No hay bloqueantes de datos. Se puede proceder directamente a la Fase 1.**

---

### FASE 1 — Backend: Endpoints de Alertas (Semanas 2–4)

**Objetivo:** Crear los endpoints de cálculo de alertas en la API de BigQuery.

| # | Tarea | Complejidad | Estimado | Dependencia |
|---|-------|------------|----------|-------------|
| 1.1 | Diseñar esquema de respuesta JSON estándar para alertas | Baja | 3h | — |
| 1.2 | Implementar AT-01: Único oferente | Media | 8h | Fase 0 |
| 1.3 | Implementar AT-02: Periodo adjudicación corto (cálculo IQR por modalidad) | Alta | 12h | Fase 0 |
| 1.4 | Implementar AT-03: Concentración proveedor-entidad (cálculo IQR por entidad) | Alta | 12h | — |
| 1.5 | Implementar AT-04: Concentración proveedor-ciudad | Media | 6h | 1.4 (reutiliza lógica) |
| 1.6 | Implementar AT-05: Concentración proveedor-mercado UNSPSC | Media | 6h | 1.4 (reutiliza lógica) |
| 1.7 | Implementar AT-06: Contratos que superan anualidad | Baja | 4h | — |
| 1.8 | Implementar AT-07: Proveedores heterogéneos UNSPSC | Media | 8h | — |
| 1.9 | Implementar endpoint resumen consolidado `/alerts/summary` | Media | 8h | 1.2–1.8 |
| 1.10 | Implementar cache/materialización de resultados | Media | 8h | 1.9 |
| 1.11 | Implementar endpoints de perfiles (`provider-profile`, `entity-profile`) | Media | 8h | 1.2–1.8 |

**Estimado total Fase 1:** ~83h (~2.5 semanas, 1 desarrollador backend)

**⚠️ Dependencia crítica:** Esta fase requiere acceso y permisos de desarrollo en el backend de BigQuery (`ms-backend-bigquery`). Si el equipo de frontend no tiene acceso, se necesita coordinación con el equipo backend.

---

### FASE 2 — Frontend: Dashboard Principal de Alertas (Semanas 3–5)

**Objetivo:** Crear la vista principal del sistema de alertas tempranas.

| # | Tarea | Complejidad | Estimado |
|---|-------|------------|----------|
| 2.1 | Agregar funciones de servicio en `helios-api.js` para todos los endpoints de alertas | Baja | 3h |
| 2.2 | Crear ruta `/dashboard/alertas-tempranas` y actualizar sidebar | Baja | 1h |
| 2.3 | Implementar Dashboard de Alertas con KPIs consolidados (total alertas por tipo, contratos afectados, valor en riesgo) | Media | 8h |
| 2.4 | Implementar gráficos de distribución: alertas por tipo (bar chart), por fuerza (bar), por entidad (top 10), tendencia temporal (area chart) | Media | 8h |
| 2.5 | Implementar panel de filtros (año, fuerza, entidad, modalidad) | Media | 6h |
| 2.6 | Diseñar y aplicar sistema de badges de riesgo (colores por nivel) | Baja | 3h |
| 2.7 | Eliminar páginas iframe NeoDash y reemplazar con redirección a nuevas vistas | Baja | 2h |

**Estimado total Fase 2:** ~31h (~1 semana)

---

### FASE 3 — Frontend: Vistas Detalladas por Alerta (Semanas 5–7)

**Objetivo:** Crear vistas individuales para cada tipo de alerta con tablas, detalle y exportación.

| # | Tarea | Complejidad | Estimado |
|---|-------|------------|----------|
| 3.1 | Crear componente reutilizable `AlertDetailView` (tabla con filtros, sort, modal detalle, badge de riesgo, explicación metodológica) | Alta | 12h |
| 3.2 | Vista AT-01: Único oferente (tabla contratos, filtros por modalidad/fuerza/entidad) | Media | 6h |
| 3.3 | Vista AT-02: Periodo adjudicación corto (tabla con delta calculado, distribución por modalidad) | Media | 6h |
| 3.4 | Vista AT-03: Concentración proveedor-entidad (tabla ranking, gráfico de participación, grafo de relaciones) | Alta | 10h |
| 3.5 | Vista AT-04: Concentración proveedor-ciudad | Media | 4h (reutiliza 3.4) |
| 3.6 | Vista AT-05: Concentración proveedor-mercado UNSPSC | Media | 4h (reutiliza 3.4) |
| 3.7 | Vista AT-06: Contratos que superan anualidad (tabla, timeline visual) | Media | 6h |
| 3.8 | Vista AT-07: Proveedores heterogéneos (tabla ranking, distribución UNSPSC) | Media | 6h |
| 3.9 | Navegación entre vistas (tabs o sub-rutas) | Baja | 3h |

**Estimado total Fase 3:** ~57h (~1.5 semanas)

---

### FASE 4 — Índice de Riesgo Compuesto y Perfiles (Semanas 7–8)

**Objetivo:** Implementar score de riesgo y vistas de perfil por proveedor/entidad.

| # | Tarea | Complejidad | Estimado |
|---|-------|------------|----------|
| 4.1 | Vista Perfil de Riesgo por Proveedor: consolidado de alertas, badge, grafo relaciones, historial contratos | Alta | 12h |
| 4.2 | Vista Perfil de Riesgo por Entidad: alertas activas, proveedores señalados, concentración | Alta | 10h |
| 4.3 | Componente de Índice de Riesgo: ranking visual de proveedores/entidades con más banderas rojas | Media | 8h |
| 4.4 | Integración con vista de Investigación existente (mostrar alertas asociadas al CC/NIT investigado) | Media | 6h |

**Estimado total Fase 4:** ~36h (~1 semana)

---

### FASE 5 — Refinamiento, QA y Documentación (Semanas 8–9)

| # | Tarea | Complejidad | Estimado |
|---|-------|------------|----------|
| 5.1 | Testing funcional de todas las alertas con datos reales | Media | 8h |
| 5.2 | Validación de resultados con equipo del Grupo de Transparencia | Media | 8h |
| 5.3 | Ajustes de UX/UI basados en feedback | Media | 8h |
| 5.4 | Documentación metodológica in-app (tooltips, paneles de ayuda) | Baja | 4h |
| 5.5 | Actualización Dockerfile y Nginx para nuevas rutas | Baja | 2h |
| 5.6 | Deploy a staging/producción | Baja | 4h |

**Estimado total Fase 5:** ~34h (~1 semana)

> **Nota:** La estimación de esfuerzo IA-First, costos por escenario, equipo requerido, cronograma y detalle de soporte se encuentran en el documento separado **[costos.md](./costos.md)**.

---

## 5. Dependencias y Bloqueantes Explícitos

### 5.1 Dependencias de Backend (Desarrollo Externo)

| ID | Dependencia | Impacto | Prioridad | Estado |
|----|------------|---------|-----------|--------|
| **DEP-01** | Endpoints de alertas en API BigQuery (`/bigquery/alerts/*`) | **Bloqueante total** para Fases 2-4 del frontend | 🔴 Crítica | Pendiente de desarrollo |
| ~~**DEP-02**~~ | ~~Merge de base secundaria en BigQuery~~ | ~~Bloquea AT-01 y AT-02~~ | — | ✅ **RESUELTO** — Ya existe en `vw_SECOP_II` |
| ~~**DEP-03**~~ | ~~Tabla clasificación Sector Defensa~~ | ~~Bloquea filtrado~~ | — | ✅ **RESUELTO** — Ya existe `Nits_defensa_vf` |

### 5.2 Estado de Datos (Validación 28-feb-2026)

| Dato | Estado | Ubicación en BigQuery |
|------|--------|----------------------|
| `proveedores_unicos_con` | ✅ **DISPONIBLE** | `bronze_zone.procesos_contratacion`, `silver_zone.vw_SECOP_II` |
| `fecha_adjudicacion` | ✅ **DISPONIBLE** | `bronze_zone.procesos_contratacion`, `silver_zone.vw_SECOP_II` |
| `fecha_de_apertura_efectiva` | ✅ **DISPONIBLE** | `bronze_zone.procesos_contratacion`, `silver_zone.vw_SECOP_II` |
| `dias_adicionados` | ✅ **DISPONIBLE** | `bronze_zone.contratos_electronicos`, `silver_zone.vw_SECOP_II` |
| `fecha_de_inicio_del_contrato` | ✅ **DISPONIBLE** | `bronze_zone.contratos_electronicos`, `silver_zone.vw_SECOP_II` |
| `fecha_de_fin_del_contrato` | ✅ **DISPONIBLE** | `bronze_zone.contratos_electronicos`, `silver_zone.vw_SECOP_II` |
| `codigo_de_categoria_principal` | ✅ **DISPONIBLE** | `bronze_zone.contratos_electronicos`, `silver_zone.vw_SECOP_II` |
| Clasificación Sector Defensa | ✅ **DISPONIBLE** | `silver_zone.Nits_defensa_vf` (Fuerza, Descripción, GSED) |
| Catálogo UNSPSC | ✅ **DISPONIBLE** | `silver_zone.codigos-unspc` (Segmento, Familia, Clase) |
| Registro RUES | ✅ **DISPONIBLE** | `bronze_zone.rues` (estado_matricula, tipo_sociedad, etc.) |

### 5.3 Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Volumen de datos (~5.59M filas) causa consultas lentas en alertas IQR | Media | UX degradada | Materializar resultados de alertas en tablas pre-calculadas; usar particiones existentes |
| Cambios en la estructura de datos SECOP | Baja | Rompe cálculos | Implementar validación de schema en ETL |
| Umbrales IQR generan exceso de falsos positivos | Media | Resultados poco útiles | Calibrar con equipo de Transparencia; permitir configuración de umbrales |
| Vista `vw_SECOP_II` (~160 cols) puede ser costosa para queries complejas | Media | Tiempo de respuesta alto | Crear vistas materializadas específicas para cada alerta |

---

## 6. Mapeo de Red Flags OCP Adicionales (Expansión Futura)

La Propuesta Metodológica v2 implementa 7 de los 73 red flags del documento OCP. Para futuras fases, los siguientes indicadores son implementables con los datos actuales:

| OCP ID | Nombre | Viabilidad con Datos Actuales |
|--------|--------|------------------------------|
| R013 | High use of non-competitive methods | ✅ Viable — `modalidad_de_contratacion` disponible |
| R011 | Splitting purchases to avoid thresholds | ✅ Viable — análisis por `nombre_entidad` + `valor_del_contrato` + periodo |
| R002 | Manipulation of procurement thresholds | ✅ Viable — análisis de distribución de valores cerca de umbrales |
| R055 | Multiple direct awards above/below threshold | ✅ Viable — filtro por contratación directa + valor |
| R069 | Contract amendments to increase price | ⚠️ Parcialmente viable — requiere `valor_del_contrato` original vs. modificado |
| R014 | Short time between tender advertising and bid opening | ⚠️ Requiere base secundaria |
| R060 | Long time between award and contract signature | ⚠️ Requiere `fecha_adjudicacion` (base secundaria) |
| R051 | High market concentration (HHI) | ✅ Viable — extensión de AT-05 con cálculo de índice Herfindahl |

---

*Documento generado el 28 de febrero de 2026 como parte del proyecto Sistema de Información Helios — Frontend.*
*Basado en: OCP (2024) "Red flags in public procurement" y Propuesta Metodológica Sistema de Alertas Tempranas v2 del MDN.*
