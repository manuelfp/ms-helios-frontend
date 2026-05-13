# Contexto del Componente — `ms-helios-frontend`

> **Fase S.O.F.I.A.**: F6 — Vista de Componente · *AI-First Documentation*
> **Tipo**: Single-page application (SPA)
> **Lenguaje**: JavaScript (React JSX)
> **Última actualización**: 2026-04-27

---

## 1. Resumen

`ms-helios-frontend` es la **aplicación web** que orquesta la experiencia de usuario del Sistema Helios. Construida con **React 18 + Vite 5 + Material UI 5 + Recharts** y servida por **nginx 1.27 alpine** detrás de Cloud Run, consume los dos backends (`ms-backend-helios-bigquery` y `ms-backend-neo4j`) para presentar dashboards, perfiles de riesgo, vistas de alertas tempranas, y la investigación 360°.

Su diferenciador clave es el **Privacy Mode global** (toggle) que enmascara CC/NIT/nombres de personas naturales por defecto, según la matriz de sensibilidad de datos del proyecto.

| Atributo | Valor |
| --- | --- |
| Versión | 0.0.0 (Vite default — bumpear en V3 al cerrar primer milestone) |
| Bounded Context | Experiencia de Usuario y Visualización (`SVC-003`) |
| Estado | En producción (`mdn-transparencia-prd`, `us-central1`) |
| Build size objetivo | < 1 MB gzipped |
| Owner | Equipo Helios-core |

## 2. Posición en el sistema

```
                  ┌────────────────────────────────┐
                  │ Usuario (browser autenticado)  │
                  └────────────────┬───────────────┘
                                   │ HTTPS
                                   ▼
                  ┌────────────────────────────────┐
                  │ ms-helios-frontend             │  ◄── este componente
                  │ Cloud Run · React + nginx      │
                  └─────┬────────────────────┬─────┘
                        │ /bigquery/...      │ /neo4j/...
                        ▼                    ▼
        ┌────────────────────────┐   ┌─────────────────────┐
        │ ms-backend-helios-bq   │   │ ms-backend-neo4j    │
        └────────────────────────┘   └─────────────────────┘
```

- **Cliente puro** (no SSR).
- **Sin estado server-side** propio: estado UI vía React Context, preferencias en `localStorage`.
- **Inyección de URLs** de backend en runtime via `entrypoint.sh` que reescribe `index.html` (no requiere rebuild).

## 3. Responsabilidades (qué SÍ hace)

- Orquestar las llamadas a los 2 backends.
- Componer dashboards con KPIs, charts y tablas.
- Implementar el **Privacy Mode** (enmascaramiento de PII en UI).
- Routing entre vistas (dashboards, perfiles, alertas, investigación).
- Visualizar grafos del backend Neo4j (nodes + links).
- Renderizar informes IA (markdown con resaltado de hallazgos y nivel de riesgo).
- Gestión de filtros compartidos entre vistas (year, fuerza, entidad, ciudad).

## 4. Out-of-scope (qué NO hace)

- ❌ Cálculo de alertas o KPIs (lo hace cada backend).
- ❌ Persistencia (excepto preferencias en `localStorage`).
- ❌ Autenticación criptográfica (delega en gateway / OIDC en V3).
- ❌ Llamadas a Vertex AI directamente (siempre vía backends — los secretos viven server-side).

## 5. Estructura interna

```
ms-helios-frontend/
├── index.html                    # Entry HTML
├── package.json                  # Dependencias React + Vite
├── vite.config.js                # Configuración build/dev
├── eslint.config.js              # ESLint preset
├── jsconfig.json                 # Path aliases
├── nginx.conf                    # Servidor estático con CSP/HSTS/etc.
├── Dockerfile                    # Multi-stage Node + Nginx
├── entrypoint.sh                 # Inyecta env vars en runtime al index.html
├── cloudbuild.yaml               # CI/CD
├── .env.example                  # Variables VITE_*
│
├── public/                       # Assets estáticos
│
├── src/
│   ├── main.jsx                  # Entry — providers, theme, BrowserRouter
│   ├── root.jsx                  # Layout raíz
│   ├── paths.js                  # Mapa central de rutas
│   ├── config-global.js          # Config visible al cliente (URLs backend)
│   │
│   ├── auth/                     # AuthProvider (placeholder MVP, OIDC en V3)
│   ├── components/               # Componentes UI reutilizables
│   │   ├── StatCard/             # KPI card
│   │   ├── GraphViewer/          # Visualización de grafos Neo4j
│   │   ├── AlertList/            # Lista de alertas por tipo
│   │   ├── PrivacyToggle/        # Toggle global Privacy Mode
│   │   └── ...
│   ├── contexts/                 # PrivacyContext, FilterContext, ApiClientContext
│   ├── hooks/
│   │   ├── useHeliosApi.js       # Único punto de fetch
│   │   ├── usePrivacyMode.js     # Lectura del toggle global
│   │   └── ...
│   ├── layouts/                  # MainLayout, AuthLayout
│   ├── pages/
│   │   ├── DashboardAlertas.jsx
│   │   ├── DashboardConsolidado.jsx
│   │   ├── PerfilProveedor.jsx
│   │   ├── PerfilEntidad.jsx
│   │   ├── Investigacion.jsx
│   │   └── ...
│   ├── routes/                   # Definiciones react-router-dom
│   ├── services/                 # Cliente HTTP único
│   │   ├── helios-api.js         # Wrapper fetch para los 2 backends
│   │   └── auth-service.js
│   ├── styles/                   # Tema MUI, globals
│   └── utils/                    # format-currency, mask-pii, etc.
│
├── contexto/
│   └── contexto.md               # Este archivo
│
└── k8s/                          # Manifiestos opcionales
```

## 6. Pantallas principales

| Ruta | Página | Brief | Estado |
| --- | --- | --- | --- |
| `/` | Redirect a dashboard | n/a | implementado |
| `/dashboard/alertas` | Dashboard de Alertas Tempranas | `UX-001` | parcial (V3) |
| `/dashboard/consolidado` | KPIs consolidados | n/a | implementado |
| `/alertas/:tipo` | Vista detallada por tipo | `UX-002` | pendiente V3 |
| `/proveedores/:doc` | Perfil de Riesgo por Proveedor | `UX-003` | parcial |
| `/entidades/:nit` | Perfil de Riesgo por Entidad | `UX-004` | pendiente V3 |
| `/investigacion` | Investigación 360° por CC/NIT | n/a | implementado (consume `/neo4j/investigate`) |
| `/grafo` | Exploración del grafo | n/a | implementado |
| `/mapa` | Mapa de calor geográfico | `UX-005` | pendiente V3 |
| `/legacy/neodash/*` | (a eliminar) páginas con NeoDash incrustado y credenciales expuestas | n/a | **DEUDA CRÍTICA `REQ-UI-008`** |

## 7. Datos consumidos

Por intermedio de `services/helios-api.js`:

| Llamada | Endpoint backend | Privacidad |
| --- | --- | --- |
| `getDashboardConsolidated()` | `GET /bigquery/stats/dashboard` | 🟢 |
| `getStatsByForce()` | `GET /bigquery/stats/contratos-por-fuerza` | 🟢 |
| `getCatalogos()` | `GET /bigquery/catalogs/*` y `GET /neo4j/catalogs/*` | 🟢 |
| `searchContracts()` | `POST /bigquery/search` | 🟢 (PII enmascarada) |
| `searchGraph()` | `POST /neo4j/graph-search` | 🟢/🟡 |
| `naturalQueryBigQuery()` | `POST /bigquery/natural-query` | 🟠 |
| `naturalQueryGraph()` | `POST /neo4j/natural-query` | 🟠 |
| `investigate(documento)` | `POST /neo4j/investigate` | 🔴 (requiere rol elevado en V3) |
| `getProviderProfile(doc)` | `GET /bigquery/alerts/provider-profile/:doc` (V3) | 🟠 |
| `getAlertsSummary()` | `GET /bigquery/alerts/summary` (V3) | 🟢 |

## 8. Eventos / observabilidad

Eventos del cliente (telemetría a backends — pendiente V3):

| Evento | Cuándo |
| --- | --- |
| `page_view` | Cada navegación |
| `filter_applied` | Aplicar filtros en una página |
| `privacy_mode_toggled` | Cambiar el toggle de Privacy Mode |
| `investigation_started` | Click en "Investigar" |
| `export_started` | Click en "Exportar" |

> Logging estructurado del frontend (V3): enviar batch a un endpoint backend dedicado o usar Cloud Logging client.

## 9. Sección IA (AI-First)

El frontend **no llama a Gemini directamente**. Renderiza:

- Resultados de queries NL (texto del SQL/Cypher generado opcionalmente visible en modal "Ver query").
- **Informe consolidado de investigación 360°**: markdown con secciones (resumen, hallazgos, recomendaciones, nivel de riesgo).

### 9.1 Renderizado del informe IA

- Markdown via `react-markdown`.
- Resaltado del badge `nivel_riesgo` (color por nivel: verde/amarillo/naranja/rojo).
- Streaming SSE (V3): mostrar el informe a medida que llega para mejor UX.

## 10. Privacidad y seguridad

| Aspecto | Implementación |
| --- | --- |
| Privacy Mode | `PrivacyContext` global, toggle persistente en `localStorage` |
| Enmascaramiento | `utils/mask-pii.js` aplica regex a CC/NIT cuando privacy=ON |
| Rol-based UI | (V3) ocultar tabs `Sanciones`, `RUES detalle` si rol < `analista-investigacion` |
| Headers HTTP | `nginx.conf`: CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff |
| Sin secretos | Solo variables `VITE_*` no sensibles (URLs de backend) |

> **Deuda crítica**: páginas legacy NeoDash con credenciales hardcodeadas (`/legacy/neodash/*`). Eliminar en V3 — `REQ-UI-008` / `REQ-SEC-002`.

## 11. Variables de entorno

| Variable | Propósito |
| --- | --- |
| `VITE_HELIOS_API_BASE_URL` | URL del backend BigQuery |
| `VITE_NEO4J_API_BASE_URL` | URL del backend Neo4j |
| `VITE_APP_ENV` | `dev` / `staging` / `prod` |
| `VITE_ENABLE_PRIVACY_MODE_DEFAULT` | `true` |

> Las variables `VITE_*` se inyectan en runtime via `entrypoint.sh` (no requiere rebuild para cambiar URLs entre ambientes).

## 12. Despliegue

| Aspecto | Configuración |
| --- | --- |
| Build | `npm run build` → `dist/` (Vite) |
| Servidor | nginx 1.27 alpine |
| Puerto Cloud Run | 8080 |
| Imagen | multi-stage `node:18-alpine` (build) + `nginx:1.27-alpine` (serve) |
| Trigger | Push a `main` → `cloudbuild.yaml` |

## 13. Convenciones aplicables

- [`convenciones/react-vite.md`](../../../convenciones/react-vite.md)
- [`convenciones/api-rest.md`](../../../convenciones/api-rest.md)
- [`convenciones/docker-kubernetes.md`](../../../convenciones/docker-kubernetes.md)
- [`convenciones/seguridad.md`](../../../convenciones/seguridad.md)

## 14. Trazabilidad

| Artefacto | Ruta |
| --- | --- |
| Requerimientos UI | `requerimientos/req.md` § 5 (REQ-UI-001..008) |
| Briefs de producto | `producto/briefs/` (UX-001, UX-003) |
| Privacidad | `requerimientos/matriz-sensibilidad-datos.md` |
| Decisiones | `arquitectura/arquitectura.md` ADR-005, ADR-010 |
