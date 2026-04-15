# Sistema Helios — Costos de Implementación y Soporte

**Proyecto:** Sistema de Alertas Tempranas de Contratación del Sector Defensa
**Enfoque:** IA-First (Cursor + Claude/GPT, GitHub Copilot, generación SQL asistida)
**Documento asociado:** [contexto_requerimientos.md](./contexto_requerimientos.md)

---

## 1. Estimación de Esfuerzo IA-First

Este proyecto adopta un enfoque **IA-first**, donde se utilizan herramientas de desarrollo asistido por IA como multiplicador de productividad en todas las fases.

### 1.1 Factor de Aceleración por Tipo de Tarea

| Tipo de Tarea | Ejemplo | Reducción IA | Justificación |
|---------------|---------|-------------|---------------|
| Generación de código (API endpoints, componentes React) | Endpoints CRUD, componentes MUI, service layer | **50-60%** | AI genera boilerplate, patrones repetitivos, integraciones API |
| Consultas SQL complejas (IQR, agregaciones) | Cálculos estadísticos de alertas sobre BigQuery | **40-50%** | AI genera SQL con funciones de ventana, CTEs, pero requiere validación contra datos reales |
| Diseño de UI/UX y componentes visuales | Dashboards, gráficos, tablas interactivas | **40-50%** | AI genera layout MUI + Recharts; refinamiento manual de UX |
| Arquitectura y diseño técnico | Diseño de schema, estrategia de cache | **20-30%** | Requiere decisiones humanas de dominio; AI sugiere opciones |
| QA y validación con datos reales | Testing contra 5.59M registros, calibración umbrales | **10-15%** | La validación de resultados estadísticos requiere experto humano + dominio del negocio |
| Coordinación con stakeholders | Reuniones con Grupo Transparencia, validación metodológica | **0%** | 100% humano |

### 1.2 Estimación Comparativa por Fase

| Fase | Horas Tradicional | Factor IA | Horas IA-First | Semanas IA-First | Estado |
|------|------------------|-----------|---------------|-----------------|--------|
| Fase 0: Validación de Datos | 9h | — | 4h | — | ✅ **COMPLETADA** |
| Fase 1: Backend Alertas (SQL + API) | 83h | 0.50 | **42h** | 1.5 | Pendiente |
| Fase 2: Frontend Dashboard Alertas | 31h | 0.45 | **17h** | 0.5 | Pendiente |
| Fase 3: Frontend Vistas Detalladas | 57h | 0.45 | **31h** | 1 | Pendiente |
| Fase 4: Índice de Riesgo + Perfiles | 36h | 0.50 | **18h** | 0.5 | Pendiente |
| Fase 5: Refinamiento y QA | 34h | 0.80 | **27h** | 1 | Pendiente |
| **TOTAL RESTANTE** | **241h** | — | **~135h** | **~4.5 sem** | — |

> **Reducción total:** De ~241h a **~135h** (reducción del **44%**), de ~7 semanas a **~4.5 semanas** calendario.
> Con ejecución paralela (backend + frontend simultáneo): **~3.5 semanas**.

### 1.3 Desglose de Horas IA-First por Componente

| Componente | Horas | % del Total |
|-----------|-------|-------------|
| SQL/BigQuery (7 alertas + IQR + materialización) | 30h | 22% |
| API endpoints (Node.js/Python) | 12h | 9% |
| Frontend React (dashboard + 7 vistas + perfiles) | 52h | 39% |
| Integración y testing | 18h | 13% |
| QA, calibración y validación con stakeholders | 15h | 11% |
| Deploy y documentación | 8h | 6% |
| **TOTAL** | **135h** | **100%** |

### 1.4 Comparativa Tradicional vs. IA-First

| Métrica | Desarrollo Tradicional | Desarrollo IA-First | Ahorro |
|---------|----------------------|--------------------|----|
| **Horas de desarrollo** | ~241h | ~135h | **44%** |
| **Semanas calendario** | 7 semanas | 3.5–4.5 semanas | **43-50%** |
| **Equipo mínimo** | 2-3 desarrolladores | 1-2 personas | **50-66%** |

---

## 2. Equipo Requerido

Con enfoque IA-first, se reduce la cantidad de personal necesario. Un desarrollador senior con herramientas IA puede cubrir el trabajo que antes requería 2 desarrolladores mid-level.

| Rol | Cantidad | Dedicación | Semanas | Perfil |
|-----|----------|-----------|---------|--------|
| **Tech Lead / Full-Stack Senior** | 1 | 100% | 4.5 | Experiencia en React + Node.js/Python + BigQuery + SQL. Dominio de herramientas IA (Cursor, Copilot). Responsable de backend y frontend. |
| **Analista Funcional / Dominio** | 1 | 50% | 4.5 | Conocimiento en contratación pública, metodología de red flags. Valida resultados estadísticos. Enlace con Grupo de Transparencia. |
| **QA / Data Validation** | 1 | 50% | 2 | Solo en Fases 4-5. Valida cálculos contra datos reales, calibra umbrales IQR. |

---

## 3. Estructura Financiera

> **Estructura aplicada a todos los escenarios:**
> - Costos directos
> - (+) 30% Imprevistos
> - (=) Subtotal con imprevistos
> - (+) 35% Utilidad
> - (=) **Total por componente**

---

## 4. Escenario A: Equipo Interno (Contratistas)

Tarifas de referencia para contratistas especializados en Colombia (2026):

### 4.1 Implementación (4.5 semanas / ~1.5 meses)

| Concepto | Costo Directo (COP) |
|----------|---------------------|
| Tech Lead / Full-Stack Senior (1.5 meses × $14.000.000) | $21.000.000 |
| Analista Funcional — 50% dedicación (1.5 meses × $8.000.000 × 50%) | $6.000.000 |
| QA / Data Validation — 50% dedicación (0.5 meses × $7.000.000 × 50%) | $1.750.000 |
| Infraestructura Cloud incremental (BigQuery, GKE, Cloud Run) — 1.5 meses | $2.250.000 |
| Licencias IA (Cursor Pro, GitHub Copilot) — 1.5 meses | $450.000 |
| **Subtotal Costos Directos Implementación** | **$31.450.000** |
| (+) Imprevistos (30%) | $9.435.000 |
| **Subtotal con Imprevistos** | **$40.885.000** |
| (+) Utilidad (35%) | $14.309.750 |
| **TOTAL IMPLEMENTACIÓN** | **$55.194.750** |

### 4.2 Soporte y Mantenimiento (12 meses)

| Concepto | Costo Mensual (COP) | Costo Anual (COP) |
|----------|---------------------|-------------------|
| Soporte correctivo y evolutivo menor — Tech Lead (8h/mes × $87.500/h) | $700.000 | $8.400.000 |
| Acompañamiento funcional — Analista (4h/mes × $50.000/h) | $200.000 | $2.400.000 |
| Recálculo y calibración de alertas (actualización datos SECOP, umbrales IQR) | Incluido | Incluido |
| Infraestructura Cloud incremental (BigQuery queries alertas + GKE) | $800.000 | $9.600.000 |
| Licencias herramientas IA | $300.000 | $3.600.000 |
| **Subtotal Costos Directos Soporte** | **$2.000.000/mes** | **$24.000.000** |
| (+) Imprevistos (30%) | | $7.200.000 |
| **Subtotal con Imprevistos** | | **$31.200.000** |
| (+) Utilidad (35%) | | $10.920.000 |
| **TOTAL SOPORTE 12 MESES** | | **$42.120.000** |

### 4.3 Resumen Escenario A

| | COP | USD |
|---|-----|-----|
| Total Implementación | $55.194.750 | ~$12.950 |
| Total Soporte 12 meses | $42.120.000 | ~$9.900 |
| **GRAN TOTAL ESCENARIO A** | **$97.314.750** | **~$22.850** |

---

## 5. Escenario B: Equipo Externo (Consultoría Especializada)

### 5.1 Implementación

| Concepto | Costo Directo (COP) |
|----------|---------------------|
| Desarrollo completo IA-first (backend + frontend + QA) — 135h × $250.000/h | $33.750.000 |
| Gestión de proyecto y coordinación | $4.500.000 |
| Infraestructura Cloud incremental — 1.5 meses | $2.250.000 |
| Licencias y herramientas | $450.000 |
| **Subtotal Costos Directos Implementación** | **$40.950.000** |
| (+) Imprevistos (30%) | $12.285.000 |
| **Subtotal con Imprevistos** | **$53.235.000** |
| (+) Utilidad (35%) | $18.632.250 |
| **TOTAL IMPLEMENTACIÓN** | **$71.867.250** |

### 5.2 Soporte y Mantenimiento (12 meses)

| Concepto | Costo Mensual (COP) | Costo Anual (COP) |
|----------|---------------------|-------------------|
| Retainer soporte correctivo y evolutivo (10h/mes × $250.000/h) | $2.500.000 | $30.000.000 |
| Infraestructura Cloud incremental | $800.000 | $9.600.000 |
| Licencias herramientas | $300.000 | $3.600.000 |
| **Subtotal Costos Directos Soporte** | **$3.600.000/mes** | **$43.200.000** |
| (+) Imprevistos (30%) | | $12.960.000 |
| **Subtotal con Imprevistos** | | **$56.160.000** |
| (+) Utilidad (35%) | | $19.656.000 |
| **TOTAL SOPORTE 12 MESES** | | **$75.816.000** |

### 5.3 Resumen Escenario B

| | COP | USD |
|---|-----|-----|
| Total Implementación | $71.867.250 | ~$16.875 |
| Total Soporte 12 meses | $75.816.000 | ~$17.800 |
| **GRAN TOTAL ESCENARIO B** | **$147.683.250** | **~$34.675** |

---

## 6. Escenario C: Desarrollador Senior Solo con IA (Mínimo Viable)

El enfoque más eficiente: un solo desarrollador full-stack senior con dominio de herramientas IA.

### 6.1 Implementación

| Concepto | Costo Directo (COP) |
|----------|---------------------|
| 1 Desarrollador Senior Full-Stack IA-first × 1.5 meses ($14.000.000/mes) | $21.000.000 |
| Infraestructura Cloud incremental — 1.5 meses | $2.250.000 |
| Licencias IA (Cursor Pro, Copilot) — 1.5 meses | $450.000 |
| **Subtotal Costos Directos Implementación** | **$23.700.000** |
| (+) Imprevistos (30%) | $7.110.000 |
| **Subtotal con Imprevistos** | **$30.810.000** |
| (+) Utilidad (35%) | $10.783.500 |
| **TOTAL IMPLEMENTACIÓN** | **$41.593.500** |

### 6.2 Soporte y Mantenimiento (12 meses)

| Concepto | Costo Mensual (COP) | Costo Anual (COP) |
|----------|---------------------|-------------------|
| Soporte correctivo y evolutivo — Dev Senior (8h/mes × $87.500/h) | $700.000 | $8.400.000 |
| Recálculo alertas, calibración umbrales, actualizaciones menores | Incluido | Incluido |
| Infraestructura Cloud incremental | $800.000 | $9.600.000 |
| Licencias herramientas IA | $300.000 | $3.600.000 |
| **Subtotal Costos Directos Soporte** | **$1.800.000/mes** | **$21.600.000** |
| (+) Imprevistos (30%) | | $6.480.000 |
| **Subtotal con Imprevistos** | | **$28.080.000** |
| (+) Utilidad (35%) | | $9.828.000 |
| **TOTAL SOPORTE 12 MESES** | | **$37.908.000** |

### 6.3 Resumen Escenario C

| | COP | USD |
|---|-----|-----|
| Total Implementación | $41.593.500 | ~$9.765 |
| Total Soporte 12 meses | $37.908.000 | ~$8.900 |
| **GRAN TOTAL ESCENARIO C** | **$79.501.500** | **~$18.665** |

---

## 7. Cuadro Comparativo de Escenarios

| Concepto | Escenario A (Interno) | Escenario B (Consultoría) | Escenario C (Solo + IA) |
|----------|----------------------|--------------------------|------------------------|
| **Costos directos implementación** | $31.450.000 | $40.950.000 | $23.700.000 |
| (+) Imprevistos 30% | $9.435.000 | $12.285.000 | $7.110.000 |
| (+) Utilidad 35% | $14.309.750 | $18.632.250 | $10.783.500 |
| **= Total Implementación** | **$55.194.750** | **$71.867.250** | **$41.593.500** |
| | | | |
| **Costos directos soporte 12m** | $24.000.000 | $43.200.000 | $21.600.000 |
| (+) Imprevistos 30% | $7.200.000 | $12.960.000 | $6.480.000 |
| (+) Utilidad 35% | $10.920.000 | $19.656.000 | $9.828.000 |
| **= Total Soporte 12 meses** | **$42.120.000** | **$75.816.000** | **$37.908.000** |
| | | | |
| **GRAN TOTAL PROYECTO** | **$97.314.750** | **$147.683.250** | **$79.501.500** |
| **Gran Total (USD)** | **~$22.850** | **~$34.675** | **~$18.665** |

---

## 8. Resumen Ejecutivo de Inversión

| | Escenario C (Recomendado) | Escenario A | Escenario B |
|---|---|---|---|
| **Inversión Total** | **$79.501.500 COP** | $97.314.750 COP | $147.683.250 COP |
| **Equivalente USD** | **~$18.665** | ~$22.850 | ~$34.675 |
| Costo mensual promedio (13.5 meses) | $5.889.000/mes | $7.208.500/mes | $10.939.500/mes |
| Equipo | 1 persona | 3 personas | Externo |
| Riesgo de ejecución | Medio (persona clave) | Bajo | Bajo |
| Flexibilidad | Alta | Media | Baja |

> **Recomendación:** El **Escenario C** ofrece la mejor relación costo-beneficio para un proyecto IA-first, con un ahorro del **46%** frente al Escenario B. El riesgo de dependencia de una sola persona se mitiga con documentación exhaustiva generada por IA y la estructura modular del código. Para mitigar aún más este riesgo, se recomienda que el Analista Funcional del Grupo de Transparencia participe activamente como validador.

---

## 9. Detalle del Soporte 12 Meses — Alcance

El soporte incluye:

| Actividad | Frecuencia | Horas/mes |
|-----------|-----------|-----------|
| Corrección de bugs y errores en producción | Reactivo | 2-3h |
| Ajustes menores de UI/UX por feedback de usuarios | Mensual | 2h |
| Recálculo y actualización de alertas cuando se actualizan datos SECOP | Quincenal (automático) | 1h supervisión |
| Calibración de umbrales IQR si hay falsos positivos | Trimestral | 2h |
| Monitoreo de infraestructura (Cloud Run, GKE, BigQuery) | Continuo | 1h |
| Actualizaciones de seguridad y dependencias | Mensual | 1h |
| Soporte a usuarios del Grupo de Transparencia | Reactivo | 1-2h |
| **Total estimado** | | **8-10h/mes** |

**No incluye:**
- Desarrollo de nuevas alertas tempranas (más allá de las 7 definidas)
- Integración con nuevas fuentes de datos
- Rediseño mayor de la interfaz
- Migración de infraestructura
- Estos se cotizan como desarrollo adicional

---

## 10. Cronograma de Implementación IA-First

```
Semana 1:  [Backend] SQL alertas AT-01 a AT-04 + API endpoints
           [Frontend] Service layer + routing + dashboard shell
           ─────────────────────────────────────────────────────

Semana 2:  [Backend] SQL alertas AT-05 a AT-07 + summary + cache
           [Frontend] Dashboard KPIs + gráficos + vistas AT-01 a AT-03
           ─────────────────────────────────────────────────────

Semana 3:  [Backend] Perfiles proveedor/entidad + risk score
           [Frontend] Vistas AT-04 a AT-07 + componente AlertDetailView
           ─────────────────────────────────────────────────────

Semana 4:  [Full-Stack] Perfiles de riesgo + índice compuesto
           [QA] Validación con datos reales + calibración umbrales
           [Deploy] Staging → Producción
           ─────────────────────────────────────────────────────

(Semana 5: Buffer para ajustes post-feedback del Grupo de Transparencia)
```

**Inicio de soporte:** Inmediatamente después del deploy a producción (Semana 5).
**Fin de soporte:** 12 meses calendario después del inicio.

---

*Documento generado el 28 de febrero de 2026 como parte del proyecto Sistema de Información Helios.*
*Complemento de: [contexto_requerimientos.md](./contexto_requerimientos.md)*
