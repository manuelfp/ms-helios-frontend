/**
 * Datos de demostración para el módulo de Alertas Tempranas.
 * Se usan cuando la API `/bigquery/alerts/*` no está disponible.
 */

const YEAR = 2025;

/** Metodología por código de alerta (Propuesta MDN v2 / OCP) */
export const METHODOLOGY = {
	"AT-01": {
		title: "AT-01 — Procesos con único oferente",
		ocpRef: "R018 — Single bid received",
		steps: [
			"Filtrar contratos cuya modalidad no sea contratación directa o régimen especial.",
			"Seleccionar registros con `proveedores_unicos_con` = 1.",
			"Marcar como alerta activa (competencia limitada).",
		],
		fields: ["id_contrato", "modalidad_de_contratacion", "proveedores_unicos_con"],
	},
	"AT-02": {
		title: "AT-02 — Periodo de adjudicación extremadamente corto",
		ocpRef: "R061 — Decision period extremely short",
		steps: [
			"Calcular delta: fecha_adjudicación − fecha_apertura_efectiva por modalidad.",
			"Obtener Q1, Q3 e IQR por modalidad.",
			"Umbral inferior: Q1 − 1.5 × IQR. Marcar si delta ≤ umbral.",
		],
		fields: ["id_contrato", "modalidad_de_contratacion", "fecha_adjudicacion", "fecha_de_apertura_efectiva"],
	},
	"AT-03": {
		title: "AT-03 — Concentración proveedor × entidad",
		ocpRef: "R040 — High share of buyer's contracts",
		steps: [
			"Agrupar por entidad del Sector Defensa y periodo (últimos 3 años).",
			"Calcular participación S(k,b,t) del proveedor k en la entidad b.",
			"Marcar si S ≥ Q3 + 1.5 × IQR (o umbral fijo 40%).",
		],
		fields: ["codigo_proveedor", "proveedor_adjudicado", "nombre_entidad", "valor_del_contrato"],
	},
	"AT-04": {
		title: "AT-04 — Concentración proveedor × ciudad",
		ocpRef: "R040",
		steps: ["Misma lógica que AT-03 agrupando por ciudad en lugar de entidad."],
		fields: ["codigo_proveedor", "ciudad", "valor_del_contrato"],
	},
	"AT-05": {
		title: "AT-05 — Concentración proveedor × mercado UNSPSC",
		ocpRef: "R050 — High market share",
		steps: ["Agrupar por segmento UNSPSC (2 primeros dígitos del código de categoría).", "Aplicar umbral IQR sobre participación."],
		fields: ["codigo_proveedor", "codigo_de_categoria_principal"],
	},
	"AT-06": {
		title: "AT-06 — Contrato que supera anualidad",
		ocpRef: "R064 — Contract modifications",
		steps: [
			"Filtrar contratos con dias_adicionados ≥ 1.",
			"Comparar año de inicio y año de fin del contrato; marcar si cruzan vigencias.",
		],
		fields: ["id_contrato", "dias_adicionados", "fecha_de_inicio_del_contrato", "fecha_de_fin_del_contrato"],
	},
	"AT-07": {
		title: "AT-07 — Proveedor con múltiples categorías UNSPSC",
		ocpRef: "R048 — Heterogeneous supplier",
		steps: [
			"Por proveedor, contar segmentos UNSPSC distintos (2 primeros dígitos).",
			"Calcular umbral global Q3 + 1.5 × IQR sobre variedades.",
			"Marcar proveedores con variedad ≥ umbral.",
		],
		fields: ["codigo_proveedor", "proveedor_adjudicado", "codigo_de_categoria_principal"],
	},
};

export const ALERT_TYPE_CARDS = [
	{ code: "AT-01", title: "Único oferente", path: "at-01", icon: "solar:user-speak-rounded-bold-duotone", color: "#E53935" },
	{ code: "AT-02", title: "Adjudicación muy rápida", path: "at-02", icon: "solar:clock-circle-bold-duotone", color: "#FB8C00" },
	{ code: "AT-03", title: "Concentración en entidad", path: "at-03", icon: "solar:buildings-bold-duotone", color: "#5C6BC0" },
	{ code: "AT-04", title: "Concentración en ciudad", path: "at-04", icon: "solar:map-point-bold-duotone", color: "#29B6F6" },
	{ code: "AT-05", title: "Concentración en mercado", path: "at-05", icon: "solar:chart-square-bold-duotone", color: "#7E57C2" },
	{ code: "AT-06", title: "Supera anualidad", path: "at-06", icon: "solar:calendar-bold-duotone", color: "#00897B" },
	{ code: "AT-07", title: "Proveedor heterogéneo", path: "at-07", icon: "solar:widget-5-bold-duotone", color: "#43A047" },
];

function filterByYear(data, ano) {
	if (ano == null || ano === "") return data;
	const y = Number(ano);
	return data.filter((row) => (row.anio == null ? true : Number(row.anio) === y));
}

export function getMockAlertsSummary(params = {}) {
	const ano = params.ano ?? YEAR;
	const counts = {
		"AT-01": 1240,
		"AT-02": 312,
		"AT-03": 89,
		"AT-04": 156,
		"AT-05": 67,
		"AT-06": 445,
		"AT-07": 28,
	};
	const total = Object.values(counts).reduce((a, b) => a + b, 0);
	return {
		generated_at: new Date().toISOString(),
		filters: { ano, fuerza: params.fuerza || null, entidad: params.entidad || null },
		kpis: {
			total_alertas: total,
			contratos_afectados: 8420,
			proveedores_senalados: 890,
			valor_en_riesgo: 1_850_000_000_000,
		},
		por_tipo: Object.entries(counts).map(([codigo, total_tipo]) => ({ codigo, total: total_tipo })),
		por_fuerza: [
			{ fuerza: "EJC", total: 2100 },
			{ fuerza: "FAC", total: 890 },
			{ fuerza: "ARC", total: 650 },
			{ fuerza: "MDN", total: 420 },
		],
		top_entidades: [
			{ nombre_entidad: "Comando Ejército Nacional", total: 340 },
			{ nombre_entidad: "Fuerza Aérea Colombiana", total: 280 },
			{ nombre_entidad: "Armada Nacional", total: 195 },
			{ nombre_entidad: "Dirección General Marítima", total: 142 },
			{ nombre_entidad: "Ministerio de Defensa", total: 98 },
		],
		tendencia_mensual: [
			{ mes: "2025-01", total: 420 },
			{ mes: "2025-02", total: 445 },
			{ mes: "2025-03", total: 390 },
			{ mes: "2025-04", total: 510 },
			{ mes: "2025-05", total: 480 },
			{ mes: "2025-06", total: 460 },
		],
		meta: { ano, mock: true },
	};
}

const ROWS_AT01 = [
	{ id_contrato: "CO1.PCCNTR.1284", modalidad_de_contratacion: "Contratación abierta", proveedores_unicos_con: 1, nombre_entidad: "Comando Ejército Nacional", fuerza: "EJC", valor_del_contrato: 450000000, anio: YEAR },
	{ id_contrato: "CO1.PCCNTR.2291", modalidad_de_contratacion: "Selección abreviada", proveedores_unicos_con: 1, nombre_entidad: "Fuerza Aérea Colombiana", fuerza: "FAC", valor_del_contrato: 1200000000, anio: YEAR },
	{ id_contrato: "CO1.PCCNTR.3310", modalidad_de_contratacion: "Mínima cuantía", proveedores_unicos_con: 1, nombre_entidad: "Armada Nacional", fuerza: "ARC", valor_del_contrato: 89000000, anio: YEAR },
];

const ROWS_AT02 = [
	{ id_contrato: "CO1.PCCNTR.4412", modalidad_de_contratacion: "Contratación abierta", dias_adjudicacion: 2, umbral_modalidad: 8, fecha_adjudicacion: "2025-03-10", fecha_de_apertura_efectiva: "2025-03-08", nombre_entidad: "Comando Ejército Nacional", anio: YEAR },
	{ id_contrato: "CO1.PCCNTR.5520", modalidad_de_contratacion: "Selección abreviada", dias_adjudicacion: 1, umbral_modalidad: 5, fecha_adjudicacion: "2025-04-02", fecha_de_apertura_efectiva: "2025-04-01", nombre_entidad: "FAC", anio: YEAR },
];

const ROWS_AT03 = [
	{ codigo_proveedor: "900123456", proveedor_adjudicado: "CONSTRUCTORA DEMO S.A.S.", nombre_entidad: "Comando Ejército Nacional", participacion_pct: 42.5, valor_total: 5600000000, alertas_activas: 3, anio: YEAR },
	{ codigo_proveedor: "800987654", proveedor_adjudicado: "SUMINISTROS DEL LLANO LTDA", nombre_entidad: "Fuerza Aérea Colombiana", participacion_pct: 38.2, valor_total: 2100000000, alertas_activas: 2, anio: YEAR },
];

const ROWS_AT04 = [
	{ codigo_proveedor: "900123456", proveedor_adjudicado: "CONSTRUCTORA DEMO S.A.S.", ciudad: "Bogotá D.C.", participacion_pct: 35.1, valor_total: 3200000000, anio: YEAR },
	{ codigo_proveedor: "860002200", proveedor_adjudicado: "TECNOLOGÍA Y DEFENSA S.A.", ciudad: "Medellín", participacion_pct: 41.0, valor_total: 1800000000, anio: YEAR },
];

const ROWS_AT05 = [
	{ codigo_proveedor: "900123456", proveedor_adjudicado: "CONSTRUCTORA DEMO S.A.S.", segmento_unspsc: "72", descripcion_segmento: "Edificación", participacion_pct: 52.3, anio: YEAR },
	{ codigo_proveedor: "830001500", proveedor_adjudicado: "SERVICIOS INTEGRALES LTDA", segmento_unspsc: "15", descripcion_segmento: "Alimentos", participacion_pct: 48.1, anio: YEAR },
];

const ROWS_AT06 = [
	{ id_contrato: "CO1.PCCNTR.6611", dias_adicionados: 120, anio_inicio: 2024, anio_fin: 2026, cruza_anualidad: true, nombre_entidad: "Comando Ejército Nacional", valor_del_contrato: 8900000000, anio: YEAR },
	{ id_contrato: "CO1.PCCNTR.7722", dias_adicionados: 45, anio_inicio: 2025, anio_fin: 2026, cruza_anualidad: true, nombre_entidad: "FAC", valor_del_contrato: 1200000000, anio: YEAR },
];

const ROWS_AT07 = [
	{ codigo_proveedor: "900123456", proveedor_adjudicado: "CONSTRUCTORA DEMO S.A.S.", categorias_distintas: 18, umbral: 12, variedad_sobre_umbral: true, anio: YEAR },
	{ codigo_proveedor: "830005000", proveedor_adjudicado: "MULTISERVICIOS GLOBALES S.A.", categorias_distintas: 15, umbral: 12, variedad_sobre_umbral: true, anio: YEAR },
];

export function getMockSingleBidder(params = {}) {
	const rows = filterByYear(ROWS_AT01, params.ano);
	return { rows, total: rows.length, mock: true };
}

export function getMockShortAward(params = {}) {
	const rows = filterByYear(ROWS_AT02, params.ano);
	return { rows, total: rows.length, mock: true };
}

export function getMockConcentrationEntity(params = {}) {
	const rows = filterByYear(ROWS_AT03, params.ano);
	return { rows, total: rows.length, graph: getMockConcentrationGraph("entity"), mock: true };
}

export function getMockConcentrationCity(params = {}) {
	const rows = filterByYear(ROWS_AT04, params.ano);
	return { rows, total: rows.length, graph: getMockConcentrationGraph("city"), mock: true };
}

export function getMockConcentrationMarket(params = {}) {
	const rows = filterByYear(ROWS_AT05, params.ano);
	return { rows, total: rows.length, graph: getMockConcentrationGraph("market"), mock: true };
}

export function getMockAnnuityExceeded(params = {}) {
	const rows = filterByYear(ROWS_AT06, params.ano);
	return { rows, total: rows.length, mock: true };
}

export function getMockHeterogeneousSupplier(params = {}) {
	const rows = filterByYear(ROWS_AT07, params.ano);
	return { rows, total: rows.length, mock: true };
}

export function getMockRiskScore() {
	return {
		ranking_proveedores: [
			{ codigo_proveedor: "900123456", proveedor_adjudicado: "CONSTRUCTORA DEMO S.A.S.", score: 87, nivel: "alto", alertas_activas: 5 },
			{ codigo_proveedor: "830001500", proveedor_adjudicado: "SERVICIOS INTEGRALES LTDA", score: 62, nivel: "medio", alertas_activas: 3 },
		],
		ranking_entidades: [
			{ nit_entidad: 899999001, nombre_entidad: "Comando Ejército Nacional", score: 71, nivel: "alto", alertas_activas: 12 },
		],
		mock: true,
	};
}

export function getMockProviderProfile(documento) {
	return {
		documento: documento || "900123456",
		proveedor_adjudicado: "CONSTRUCTORA DEMO S.A.S.",
		nivel_riesgo: "alto",
		score: 87,
		alertas_por_tipo: { "AT-01": 2, "AT-03": 1, "AT-05": 1, "AT-07": 1 },
		contratos_recientes: ROWS_AT01,
		graph: getMockConcentrationGraph("entity"),
		mock: true,
	};
}

export function getMockEntityProfile(nit) {
	return {
		nit_entidad: nit || 899999001,
		nombre_entidad: "Comando Ejército Nacional",
		fuerza: "EJC",
		nivel_riesgo: "medio",
		score: 55,
		proveedores_con_alertas: ROWS_AT03,
		distribucion_modalidad: [
			{ modalidad: "Contratación abierta", total: 120 },
			{ modalidad: "Selección abreviada", total: 45 },
		],
		graph: getMockConcentrationGraph("entity"),
		mock: true,
	};
}

export function getMockConcentrationGraph(kind = "entity") {
	const base = {
		nodes: [
			{
				id: "prov-900123456",
				group: "PROVEEDOR",
				properties: { Nombre_Proveedor: "CONSTRUCTORA DEMO S.A.S.", Documento_Proveedor: "900123456" },
			},
			{
				id: "ent-ejc",
				group: "ENTIDADES_CONTRATOS",
				properties: { Nombre_Entidad: "Comando Ejército Nacional", Nit_Entidad: 899999001 },
			},
			{
				id: "ct-001",
				group: "CONTRATOS",
				properties: { Ref_Contrato: "CO1.PCCNTR.1284", Valor_Contrato: 450000000 },
			},
		],
		links: [
			{ source: "prov-900123456", target: "ct-001" },
			{ source: "ent-ejc", target: "ct-001" },
		],
	};
	if (kind === "city") {
		base.nodes.push({
			id: "ciudad-bog",
			group: "CIUDAD",
			properties: { nombre: "Bogotá D.C." },
		});
		base.links.push({ source: "prov-900123456", target: "ciudad-bog" });
	}
	if (kind === "market") {
		base.nodes.push({
			id: "seg-72",
			group: "FUERZA",
			properties: { nombre: "Segmento UNSPSC 72 — Edificación" },
		});
		base.links.push({ source: "prov-900123456", target: "seg-72" });
	}
	return base;
}
