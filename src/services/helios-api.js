import axios from "@/utils/axios";

import * as mockAlerts from "@/services/mock-alerts";

// ═══════════════════════════════════════════════════════════════════════
//  BigQuery API  (/bigquery)  — primary data source (fast)
//  Neo4j API     (/neo4j)     — graph visualization only
// ═══════════════════════════════════════════════════════════════════════

// ─── SSE helpers ──────────────────────────────────────────────────

async function consumeSSE(url, { method = "GET", body, signal } = {}, handlers) {
	const headers = { Accept: "text/event-stream" };
	if (body) headers["Content-Type"] = "application/json";

	const res = await fetch(url, {
		method,
		headers,
		body: body ? JSON.stringify(body) : undefined,
		signal,
	});

	if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buffer = "";

	while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		buffer += decoder.decode(value, { stream: true });

		const parts = buffer.split("\n\n");
		buffer = parts.pop();

		for (const raw of parts) {
			let eventType = "message";
			let dataStr = "";
			for (const line of raw.split("\n")) {
				if (line.startsWith("event:")) eventType = line.slice(6).trim();
				else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
			}
			if (!dataStr) continue;
			try {
				const payload = JSON.parse(dataStr);
				handlers[eventType]?.(payload);
			} catch {
				handlers[eventType]?.({ raw: dataStr });
			}
		}
	}
}

function buildURL(path, params) {
	const base = (axios.defaults.baseURL || "").replace(/\/$/, "");
	const url = new URL(`${base}${path}`, window.location.origin);
	if (params) Object.entries(params).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, v); });
	return url.toString();
}

// ─── Health ────────────────────────────────────────────────────────
export const getStatus = () => axios.get("/status").then((r) => r.data);

// ─── Lookup de NIT por nombre ─────────────────────────────────────
/**
 * Resuelve uno o varios NIT candidatos a partir del nombre de una empresa o
 * entidad, cruzando con proveedores_unicos, vw_rues, Nits_defensa_vf y
 * vw_contratos_electronicos. Útil para registros de SECOP que no traen
 * documento del proveedor / entidad.
 *
 * @param {string} nombre
 * @param {"proveedor"|"entidad"|"any"} [tipo="any"]
 * @returns {Promise<{ matches: Array<{ nit: string, nombre_oficial: string, confianza: number, fuente: string, fuentes: string[] }>, normalized: string, sources_consulted: string[] }>}
 */
export const lookupNitByName = (nombre, tipo = "any") =>
	axios
		.get("/bigquery/lookup/nit-by-name", { params: { nombre, tipo } })
		.then((r) => r.data);

// ═══════════════════════════════════════════════════════════════════════
//  BigQuery endpoints — data, stats, catalogs, investigation
// ═══════════════════════════════════════════════════════════════════════

// ─── Consultas Directas (SQL) ─────────────────────────────────────
export const executeQuery = (query, user) =>
	axios.post("/bigquery/query", { query, user }).then((r) => r.data);

// ─── Lenguaje Natural (Gemini → SQL) ─────────────────────────────
export const naturalQuery = (question, user) =>
	axios.post("/bigquery/natural-query", { question, user }).then((r) => r.data);

// ─── Búsqueda con filtros (tabla + resumen) ──────────────────────
export const contractSearch = (filters = {}) =>
	axios.post("/bigquery/search", filters).then((r) => r.data);

export const getReconciliation = (documento) =>
	axios.get(`/bigquery/reconciliation/${encodeURIComponent(String(documento || "").trim())}`).then((r) => r.data);

// ─── Investigación por CC/NIT ─────────────────────────────────────
export const investigate = (documento, user) =>
	axios.post("/bigquery/investigate", { documento, user }).then((r) => r.data);

export function investigateStream(documento, user, handlers = {}, signal) {
	return consumeSSE(
		buildURL("/bigquery/investigate/stream"),
		{ method: "POST", body: { documento, user }, signal },
		handlers,
	);
}

// ─── Catálogos ─────────────────────────────────────────────────────
export const getCatalogFuerzas = () =>
	axios.get("/bigquery/catalogs/fuerzas").then((r) => r.data);

export const getCatalogAnios = () =>
	axios.get("/bigquery/catalogs/anios").then((r) => r.data);

export const getCatalogEntidades = (search) =>
	axios.get("/bigquery/catalogs/entidades", { params: search ? { search } : {} }).then((r) => r.data);

export const getCatalogCiudades = (search) =>
	axios.get("/bigquery/catalogs/ciudades", { params: search ? { search } : {} }).then((r) => r.data);

export const getCatalogProveedores = (search) =>
	axios.get("/bigquery/catalogs/proveedores", { params: search ? { search } : {} }).then((r) => r.data);

export const getCatalogDepartamentos = (search) =>
	axios.get("/bigquery/catalogs/departamentos", { params: search ? { search } : {} }).then((r) => r.data);

// ─── Dashboard + Streaming ────────────────────────────────────────
export const getDashboard = (ano) =>
	axios.get("/bigquery/stats/dashboard", { params: ano ? { ano } : {} }).then((r) => r.data);

export function dashboardStream(ano, handlers = {}, signal) {
	return consumeSSE(
		buildURL("/bigquery/stats/dashboard/stream", ano ? { ano } : {}),
		{ method: "GET", signal },
		handlers,
	);
}

// ─── Estadísticas y KPIs ──────────────────────────────────────────
export const getResumen = (ano) =>
	axios.get("/bigquery/stats/resumen", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getContratosPorAnio = () =>
	axios.get("/bigquery/stats/contratos-por-anio").then((r) => r.data);

export const getContratosPorFuerza = (ano) =>
	axios.get("/bigquery/stats/contratos-por-fuerza", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getMontosFuerzaCiudad = (fuerza, ano) =>
	axios.get("/bigquery/stats/montos-fuerza-ciudad", { params: { ...(fuerza ? { fuerza } : {}), ...(ano ? { ano } : {}) } }).then((r) => r.data);

export const getMontosPorEntidad = (ano, limit = 30) =>
	axios.get("/bigquery/stats/montos-por-entidad", { params: { ...(ano ? { ano } : {}), limit } }).then((r) => r.data);

export const getContratosPorProveedor = (ano, limit = 30) =>
	axios.get("/bigquery/stats/contratos-por-proveedor", { params: { ...(ano ? { ano } : {}), limit } }).then((r) => r.data);

export const getContratosProveedorCiudad = (proveedor, ano) =>
	axios.get("/bigquery/stats/contratos-proveedor-ciudad", { params: { ...(proveedor ? { proveedor } : {}), ...(ano ? { ano } : {}) } }).then((r) => r.data);

export const getContratosAnioProveedor = (proveedor) =>
	axios.get("/bigquery/stats/contratos-anio-proveedor", { params: { proveedor } }).then((r) => r.data);

export const getContratosAnioFuerza = (fuerza) =>
	axios.get("/bigquery/stats/contratos-anio-fuerza", { params: fuerza ? { fuerza } : {} }).then((r) => r.data);

export const getContratosEntidadAnio = (entidad, ano) =>
	axios.get("/bigquery/stats/contratos-entidad-anio", { params: { ...(entidad ? { entidad } : {}), ano } }).then((r) => r.data);

export const getMontosPorAnio = () =>
	axios.get("/bigquery/stats/montos-por-anio").then((r) => r.data);

export const getMontosPorMes = (ano) =>
	axios.get("/bigquery/stats/montos-por-mes", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getContratosPorEstado = (ano) =>
	axios.get("/bigquery/stats/contratos-por-estado", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getContratosPorTipo = (ano) =>
	axios.get("/bigquery/stats/contratos-por-tipo", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getContratosPorModalidad = (ano) =>
	axios.get("/bigquery/stats/contratos-por-modalidad", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getTopProveedoresPais = (ano, limit = 20) =>
	axios.get("/bigquery/stats/top-proveedores-pais", { params: { ...(ano ? { ano } : {}), limit } }).then((r) => r.data);

export const getTopProveedoresDepartamento = (departamento, ano, limit = 20) =>
	axios.get("/bigquery/stats/top-proveedores-departamento", { params: { departamento, ...(ano ? { ano } : {}), limit } }).then((r) => r.data);

export const getTopProveedoresCiudad = (ciudad, ano, limit = 20) =>
	axios.get("/bigquery/stats/top-proveedores-ciudad", { params: { ciudad, ...(ano ? { ano } : {}), limit } }).then((r) => r.data);

export const getContratosPorDepartamento = (ano) =>
	axios.get("/bigquery/stats/contratos-por-departamento", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getSanciones = () =>
	axios.get("/bigquery/stats/sanciones").then((r) => r.data);

export const getConcentracion = (ano, limit = 20) =>
	axios.get("/bigquery/stats/concentracion", { params: { ...(ano ? { ano } : {}), limit } }).then((r) => r.data);

// ═══════════════════════════════════════════════════════════════════════
//  Alertas tempranas (/bigquery/alerts/*) — fallback a mock si API no existe
// ═══════════════════════════════════════════════════════════════════════

async function alertsOrMock(apiCall, mockFn) {
	try {
		const data = await apiCall();
		return data;
	} catch {
		return typeof mockFn === "function" ? mockFn() : mockFn;
	}
}

/** @param {Record<string, string|number|undefined>} [params] */
export const getAlertsSummary = (params) =>
	alertsOrMock(
		() => axios.get("/bigquery/alerts/summary", { params }).then((r) => r.data),
		() => mockAlerts.getMockAlertsSummary(params || {}),
	);

export const getAlertSingleBidder = (params) =>
	alertsOrMock(
		() => axios.get("/bigquery/alerts/single-bidder", { params }).then((r) => r.data),
		() => mockAlerts.getMockSingleBidder(params || {}),
	);

export const getAlertShortAward = (params) =>
	alertsOrMock(
		() => axios.get("/bigquery/alerts/short-award-period", { params }).then((r) => r.data),
		() => mockAlerts.getMockShortAward(params || {}),
	);

export const getAlertConcentrationEntity = (params) =>
	alertsOrMock(
		() => axios.get("/bigquery/alerts/concentration-entity", { params }).then((r) => r.data),
		() => mockAlerts.getMockConcentrationEntity(params || {}),
	);

export const getAlertConcentrationCity = (params) =>
	alertsOrMock(
		() => axios.get("/bigquery/alerts/concentration-city", { params }).then((r) => r.data),
		() => mockAlerts.getMockConcentrationCity(params || {}),
	);

export const getAlertConcentrationMarket = (params) =>
	alertsOrMock(
		() => axios.get("/bigquery/alerts/concentration-market", { params }).then((r) => r.data),
		() => mockAlerts.getMockConcentrationMarket(params || {}),
	);

export const getAlertAnnuityExceeded = (params) =>
	alertsOrMock(
		() => axios.get("/bigquery/alerts/annuity-exceeded", { params }).then((r) => r.data),
		() => mockAlerts.getMockAnnuityExceeded(params || {}),
	);

export const getAlertHeterogeneousSupplier = (params) =>
	alertsOrMock(
		() => axios.get("/bigquery/alerts/heterogeneous-supplier", { params }).then((r) => r.data),
		() => mockAlerts.getMockHeterogeneousSupplier(params || {}),
	);

export const getAlertRiskScore = (params) =>
	alertsOrMock(
		() => axios.get("/bigquery/alerts/risk-score", { params }).then((r) => r.data),
		() => mockAlerts.getMockRiskScore(params || {}),
	);

export const getProviderAlertProfile = (documento, params) =>
	alertsOrMock(
		() =>
			axios
				.get(`/bigquery/alerts/provider-profile/${encodeURIComponent(documento)}`, { params })
				.then((r) => r.data),
		() => mockAlerts.getMockProviderProfile(documento),
	);

export const getEntityAlertProfile = (nit, params) =>
	alertsOrMock(
		() => axios.get(`/bigquery/alerts/entity-profile/${encodeURIComponent(nit)}`, { params }).then((r) => r.data),
		() => mockAlerts.getMockEntityProfile(nit),
	);

// ═══════════════════════════════════════════════════════════════════════
//  Neo4j endpoints — graph visualization ONLY
// ═══════════════════════════════════════════════════════════════════════

export const neo4jGraphSearch = (filters = {}) =>
	axios.post("/neo4j/graph-search", filters).then((r) => r.data);
