import { useCallback, useEffect, useState } from "react";

import { useSearchParams } from "react-router-dom";

import { getCatalogAnios, getCatalogFuerzas } from "@/services/helios-api";

const FALLBACK_YEAR = "2024";

export function useAlertFilters() {
	const [searchParams, setSearchParams] = useSearchParams();
	const [anios, setAnios] = useState([]);
	const [fuerzas, setFuerzas] = useState([]);

	const [ano, _setAno] = useState(() => searchParams.get("ano") || FALLBACK_YEAR);
	const [fuerza, _setFuerza] = useState(() => searchParams.get("fuerza") || "");

	useEffect(() => {
		_setAno(searchParams.get("ano") || FALLBACK_YEAR);
		_setFuerza(searchParams.get("fuerza") || "");
	}, [searchParams]);

	useEffect(() => {
		getCatalogAnios()
			.then((d) => setAnios(Array.isArray(d) ? d : []))
			.catch(() => setAnios([]));
		getCatalogFuerzas()
			.then((d) => setFuerzas(Array.isArray(d) ? d : []))
			.catch(() => setFuerzas([]));
	}, []);

	const setAno = useCallback(
		(v) => {
			const next = v || FALLBACK_YEAR;
			_setAno(next);
			setSearchParams(
				(prev) => {
					const sp = new URLSearchParams(prev);
					sp.set("ano", next);
					return sp;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	const setFuerza = useCallback(
		(v) => {
			_setFuerza(v || "");
			setSearchParams(
				(prev) => {
					const sp = new URLSearchParams(prev);
					if (v) sp.set("fuerza", v);
					else sp.delete("fuerza");
					return sp;
				},
				{ replace: true },
			);
		},
		[setSearchParams],
	);

	const resetFilters = useCallback(() => {
		_setAno(FALLBACK_YEAR);
		_setFuerza("");
		setSearchParams(
			(prev) => {
				const sp = new URLSearchParams(prev);
				sp.set("ano", FALLBACK_YEAR);
				sp.delete("fuerza");
				return sp;
			},
			{ replace: true },
		);
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
