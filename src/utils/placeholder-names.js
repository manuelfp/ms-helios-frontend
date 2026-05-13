const PLACEHOLDER_NORMALIZED = new Set([
	"SIN DESCRIPCION",
	"SIN DESCRIPCIÓN",
	"PERSONA NATURAL",
	"NO DEFINIDO",
	"SIN DESCRIPCION ",
]);

/** @param {unknown} name */
export function isPlaceholderName(name) {
	if (name == null) return true;
	const s = String(name).trim().toUpperCase();
	if (!s) return true;
	return PLACEHOLDER_NORMALIZED.has(s) || s === "NO DEFINIDO" || s === "SIN DESCRIPCION";
}
