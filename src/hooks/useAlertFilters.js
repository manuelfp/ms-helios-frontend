import { useCallback, useEffect, useRef, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { getCatalogAnios, getCatalogFuerzas } from "@/services/helios-api";

const FALLBACK_YEAR = "2024";

export function useAlertFilters() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [anios, setAnios] = useState([]);
	const [fuerzas, setFuerzas] = useState([]);
	const didSetDefault = useRef(false);

	const rawAno = searchParams.get("ano");
	const rawFuerza = searchParams.get("fuerza") || "";

	useEffect(() => {
		getCatalogAnios()
			.then((d) => setAnios(Array.isArray(d) ? d : []))
			.catch(() => setAnios([]));
		getCatalogFuerzas()
			.then((d) => setFuerzas(Array.isArray(d) ? d : []))
			.catch(() => setFuerzas([]));
	}, []);

	useEffect(() => {
		if (!rawAno && !didSetDefault.current) {
			const defaultYear = anios.length ? String(anios[0]) : FALLBACK_YEAR;
			didSetDefault.current = true;
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					next.set("ano", defaultYear);
					return next;
				},
				{ replace: true },
			);
		}
	}, [rawAno, anios, setSearchParams]);

	const ano = rawAno || (anios.length ? String(anios[0]) : FALLBACK_YEAR);
	const fuerza = rawFuerza;

	const setAno = useCallback(
		(v) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					if (v) next.set("ano", v);
					else next.delete("ano");
					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	const setFuerza = useCallback(
		(v) => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					if (v) next.set("fuerza", v);
					else next.delete("fuerza");
					return next;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	const resetFilters = useCallback(() => {
		didSetDefault.current = false;
		setSearchParams({}, { replace: true });
	}, [setSearchParams]);

	const params = { ano: ano || undefined, fuerza: fuerza || undefined };

	const buildLink = useCallback(
		(basePath) => {
			const sp = new URLSearchParams();
			if (ano) sp.set("ano", ano);
			if (fuerza) sp.set("fuerza", fuerza);
			const qs = sp.toString();
			return qs ? `${basePath}?${qs}` : basePath;
		},
		[ano, fuerza],
	);

	return { ano, fuerza, setAno, setFuerza, resetFilters, anios, fuerzas, params, buildLink };
}
