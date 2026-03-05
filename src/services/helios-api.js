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
