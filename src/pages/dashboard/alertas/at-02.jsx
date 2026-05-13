import { useEffect, useState } from "react";

import { Link as RouterLink } from "react-router-dom";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { AlertDetailView } from "@/components/alertas/AlertDetailView";
import { AlertFilterBar } from "@/components/alertas/AlertFilterBar";
import { METHODOLOGY } from "@/services/mock-alerts";
import { getAlertShortAward } from "@/services/helios-api";
import { useAlertFilters } from "@/hooks/useAlertFilters";
import { isValidNitOrDoc, paths } from "@/paths";

const COLUMNS = [
	{ key: "id_contrato", label: "ID Contrato" },
	{ key: "modalidad_de_contratacion", label: "Modalidad", maxWidth: 200 },
	{ key: "dias_adjudicacion", label: "Días adjudicación", align: "right", format: "number" },
	{ key: "umbral_modalidad", label: "Umbral (días)", align: "right", format: "number" },
	{ key: "fecha_de_apertura_efectiva", label: "Apertura" },
	{ key: "fecha_adjudicacion", label: "Adjudicación" },
	{
		key: "nombre_entidad",
		label: "Entidad",
		maxWidth: 240,
		linkTo: (row) => (isValidNitOrDoc(row.nit_entidad) ? paths.dashboard.investigarDoc(row.nit_entidad) : null),
		linkTitle: "Investigar a la entidad en Helios",
		lookupBy: (row) => (row.nombre_entidad ? { nombre: row.nombre_entidad, tipo: "entidad" } : null),
	},
];

export default function AlertasAt02Page() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState({ rows: [] });
	const { ano, setAno, anios, params, buildLink } = useAlertFilters();

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		getAlertShortAward(params)
			.then((d) => {
				if (!cancelled) setData(d || { rows: [] });
			})
			.catch(() => {
				if (!cancelled) setData({ rows: [] });
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [ano]);

	return (
		<Stack spacing={2}>
			<Button component={RouterLink} to={buildLink(paths.dashboard.alertas)} size="small" variant="text">
				← Volver al resumen de alertas
			</Button>
			<AlertFilterBar ano={ano} setAno={setAno} anios={anios} compact />
			<AlertDetailView
				title="Periodo de adjudicación extremadamente corto"
				subtitle="Contratos cuyo delta adjudicación − apertura está por debajo del umbral IQR por modalidad (AT-02)."
				alertCode="AT-02"
				columns={COLUMNS}
				rows={data.rows || []}
				loading={loading}
				methodology={METHODOLOGY["AT-02"]}
				exportFileName="alertas-at-02.csv"
				mockBanner={!!data.mock}
			/>
		</Stack>
	);
}
