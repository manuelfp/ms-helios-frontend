import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/** @param {unknown} raw @param {unknown} def */
function coerce(raw, def) {
	if (typeof def === "number") {
		const n = parseInt(String(raw), 10);
		return Number.isFinite(n) ? n : def;
	}
	return raw == null || raw === "" ? def : String(raw);
}

/**
 * Sync filter object with URL search params (keys = param names).
 * Pass stable `defaults` (module-level constant), not inline objects.
 * @template {Record<string, string|number>} T
 * @param {T} defaults
 * @returns {[T, (patch: Partial<T> | ((prev: T) => Partial<T>)) => void]}
 */
export function useUrlFilters(defaults) {
	const [searchParams, setSearchParams] = useSearchParams();

	const filters = useMemo(() => {
		const out = { ...defaults };
		for (const key of Object.keys(defaults)) {
			const raw = searchParams.get(key);
			if (raw == null || raw === "") continue;
			out[key] = coerce(raw, defaults[key]);
		}
		return /** @type {T} */ (out);
	}, [searchParams, defaults]);

	const setFilters = useCallback(
		(patch) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					const merged = { ...defaults };
					for (const key of Object.keys(defaults)) {
						const raw = prev.get(key);
						if (raw != null && raw !== "") merged[key] = coerce(raw, defaults[key]);
					}
					const p = typeof patch === "function" ? patch(/** @type {T} */ (merged)) : patch;
					Object.assign(merged, p);
					for (const key of Object.keys(defaults)) {
						const v = merged[key];
						const def = defaults[key];
						if (v === def || v === "" || v == null) next.delete(key);
						else next.set(key, String(v));
					}
					return next;
				},
				{ replace: true },
			);
		},
		[defaults, setSearchParams],
	);

	return [filters, setFilters];
}

export const CONTRATOS_URL_DEFAULTS = Object.freeze({
	fuerza: "",
	ano: 2025,
	entidad: "",
	ciudad: "",
	proveedor: "",
	documento: "",
	limit: 30,
});

export const INVESTIGACION_URL_DEFAULTS = Object.freeze({ doc: "" });

export const CONSULTA_IA_URL_DEFAULTS = Object.freeze({ q: "" });
