const PLACEHOLDER_NORMALIZED = new Set([
	"SIN DESCRIPCION",
	"SIN DESCRIPCIÓN",
	"PERSONA NATURAL",
	"NO DEFINIDO",
	"NO DEFINIDA",
	"NO REGISTRA",
	"N/A",
	"NA",
	"NULL",
	"-",
	"--",
]);

/** @param {unknown} name */
export function isPlaceholderName(name) {
	if (name == null) return true;
	const s = String(name).trim().toUpperCase();
	if (!s) return true;
	return PLACEHOLDER_NORMALIZED.has(s);
}

/**
 * Detecta NIT/documento placeholder: nulo, vacío, "0", textos como "NO DEFINIDO".
 * @param {unknown} doc
 */
export function isPlaceholderDocumento(doc) {
	if (doc == null) return true;
	const s = String(doc).trim();
	if (!s) return true;
	if (/^0+$/.test(s)) return true;
	return isPlaceholderName(s);
}

/**
 * Devuelve el motivo legible cuando un valor es placeholder.
 * @param {unknown} value
 */
export function placeholderReason(value) {
	if (value == null || String(value).trim() === "") return "Valor vacío en la fuente";
	const s = String(value).trim().toUpperCase();
	if (/^0+$/.test(s)) return "Documento marcado como 0 / sin identificación en SECOP";
	if (PLACEHOLDER_NORMALIZED.has(s)) return `Etiqueta genérica reportada por SECOP: "${value}"`;
	return null;
}

/**
 * Heur\u00edstica: \u00bfla clave de una columna probablemente representa un NIT/documento?
 * @param {string} key
 */
export function isDocumentoColumn(key) {
	const k = String(key || "").toLowerCase();
	return /(^|_)nit($|_)|documento|cedula|c\u00e9dula|cc/.test(k);
}
