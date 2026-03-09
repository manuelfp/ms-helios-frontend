import axios from "@/utils/axios";

// ─── Health ────────────────────────────────────────────────────────
export const getStatus = () => axios.get("/status").then((r) => r.data);

// ─── Consultas Directas ────────────────────────────────────────────
export const executeQuery = (query, user) =>
	axios.post("/neo4j/query", { query, user }).then((r) => r.data);

// ─── Lenguaje Natural (Gemini AI) ──────────────────────────────────
export const naturalQuery = (question, user) =>
	axios.post("/neo4j/natural-query", { question, user }).then((r) => r.data);

// ─── Búsqueda por Filtros (Grafos) ────────────────────────────────
export const graphSearch = (filters = {}) =>
	axios.post("/neo4j/graph-search", filters).then((r) => r.data);

// ─── Investigación por CC/NIT ──────────────────────────────────────
export const investigate = (documento, user) =>
	axios.post("/neo4j/investigate", { documento, user }).then((r) => r.data);

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

/**
 * Stream-based investigation via SSE (POST /neo4j/investigate/stream).
 */
export function investigateStream(documento, user, handlers = {}, signal) {
	return consumeSSE(
		buildURL("/neo4j/investigate/stream"),
		{ method: "POST", body: { documento, user }, signal },
		handlers,
	);
}

/**
 * Stream-based dashboard via SSE (GET /neo4j/stats/dashboard/stream).
 * Each KPI arrives as a separate `kpi` event with { key, data }.
 */
export function dashboardStream(ano, handlers = {}, signal) {
	return consumeSSE(
		buildURL("/neo4j/stats/dashboard/stream", ano ? { ano } : {}),
		{ method: "GET", signal },
		handlers,
	);
}

// ─── Catálogos ─────────────────────────────────────────────────────
export const getCatalogFuerzas = () =>
	axios.get("/neo4j/catalogs/fuerzas").then((r) => r.data);

export const getCatalogAnios = () =>
	axios.get("/neo4j/catalogs/anios").then((r) => r.data);

export const getCatalogEntidades = (search) =>
	axios.get("/neo4j/catalogs/entidades", { params: search ? { search } : {} }).then((r) => r.data);

export const getCatalogCiudades = (search) =>
	axios.get("/neo4j/catalogs/ciudades", { params: search ? { search } : {} }).then((r) => r.data);

export const getCatalogProveedores = (search) =>
	axios.get("/neo4j/catalogs/proveedores", { params: search ? { search } : {} }).then((r) => r.data);

export const getCatalogDepartamentos = (search) =>
	axios.get("/neo4j/catalogs/departamentos", { params: search ? { search } : {} }).then((r) => r.data);

// ─── Estadísticas y KPIs ──────────────────────────────────────────
export const getDashboard = (ano) =>
	axios.get("/neo4j/stats/dashboard", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getResumen = () =>
	axios.get("/neo4j/stats/resumen").then((r) => r.data);

export const getContratosPorAnio = () =>
	axios.get("/neo4j/stats/contratos-por-anio").then((r) => r.data);

export const getContratosPorFuerza = () =>
	axios.get("/neo4j/stats/contratos-por-fuerza").then((r) => r.data);

export const getMontosFuerzaCiudad = (fuerza) =>
	axios.get("/neo4j/stats/montos-fuerza-ciudad", { params: fuerza ? { fuerza } : {} }).then((r) => r.data);

export const getMontosPorEntidad = (limit = 30) =>
	axios.get("/neo4j/stats/montos-por-entidad", { params: { limit } }).then((r) => r.data);

export const getContratosPorProveedor = (limit = 30) =>
	axios.get("/neo4j/stats/contratos-por-proveedor", { params: { limit } }).then((r) => r.data);

export const getContratosProveedorCiudad = (proveedor) =>
	axios.get("/neo4j/stats/contratos-proveedor-ciudad", { params: proveedor ? { proveedor } : {} }).then((r) => r.data);

export const getContratosAnioProveedor = (proveedor) =>
	axios.get("/neo4j/stats/contratos-anio-proveedor", { params: { proveedor } }).then((r) => r.data);

export const getContratosAnioFuerza = (fuerza) =>
	axios.get("/neo4j/stats/contratos-anio-fuerza", { params: fuerza ? { fuerza } : {} }).then((r) => r.data);

export const getContratosEntidadAnio = (entidad) =>
	axios.get("/neo4j/stats/contratos-entidad-anio", { params: entidad ? { entidad } : {} }).then((r) => r.data);

export const getMontosPorAnio = () =>
	axios.get("/neo4j/stats/montos-por-anio").then((r) => r.data);

export const getMontosPorMes = (ano) =>
	axios.get("/neo4j/stats/montos-por-mes", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getContratosPorEstado = (ano) =>
	axios.get("/neo4j/stats/contratos-por-estado", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getContratosPorTipo = (ano) =>
	axios.get("/neo4j/stats/contratos-por-tipo", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getContratosPorModalidad = (ano) =>
	axios.get("/neo4j/stats/contratos-por-modalidad", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getTopProveedoresPais = (ano, limit = 20) =>
	axios.get("/neo4j/stats/top-proveedores-pais", { params: { ...(ano ? { ano } : {}), limit } }).then((r) => r.data);

export const getTopProveedoresDepartamento = (departamento, ano, limit = 20) =>
	axios.get("/neo4j/stats/top-proveedores-departamento", { params: { departamento, ...(ano ? { ano } : {}), limit } }).then((r) => r.data);

export const getTopProveedoresCiudad = (ciudad, ano, limit = 20) =>
	axios.get("/neo4j/stats/top-proveedores-ciudad", { params: { ciudad, ...(ano ? { ano } : {}), limit } }).then((r) => r.data);

export const getContratosPorDepartamento = (ano) =>
	axios.get("/neo4j/stats/contratos-por-departamento", { params: ano ? { ano } : {} }).then((r) => r.data);

export const getSanciones = () =>
	axios.get("/neo4j/stats/sanciones").then((r) => r.data);

export const getConcentracion = (ano, limit = 20) =>
	axios.get("/neo4j/stats/concentracion", { params: { ...(ano ? { ano } : {}), limit } }).then((r) => r.data);
