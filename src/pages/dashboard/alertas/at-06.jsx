import { useEffect, useState } from "react";

import { Link as RouterLink } from "react-router-dom";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { AlertDetailView } from "@/components/alertas/AlertDetailView";
import { METHODOLOGY } from "@/services/mock-alerts";
import { getAlertAnnuityExceeded } from "@/services/helios-api";
import { paths } from "@/paths";

const COLUMNS = [
	{ key: "id_contrato", label: "ID Contrato" },
	{ key: "dias_adicionados", label: "Días adicionados", align: "right", format: "number" },
	{ key: "anio_inicio", label: "Año inicio", align: "right", format: "number" },
	{ key: "anio_fin", label: "Año fin", align: "right", format: "number" },
	{ key: "cruza_anualidad", label: "Cruza vigencia" },
	{ key: "nombre_entidad", label: "Entidad", maxWidth: 260 },
	{ key: "valor_del_contrato", label: "Valor", align: "right", format: "currency" },
];

export default function AlertasAt06Page() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState({ rows: [] });

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		getAlertAnnuityExceeded({})
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
	}, []);

	const rows = (data.rows || []).map((r) => ({
		...r,
		cruza_anualidad: r.cruza_anualidad ? "Sí" : "No",
	}));

	return (
		<Stack spacing={2}>
			<Button component={RouterLink} to={paths.dashboard.alertas} size="small" variant="text">
				← Volver al resumen de alertas
			</Button>
			<AlertDetailView
				title="Contratos que superan anualidad"
				subtitle="Plazo modificado por adiciones de forma que el contrato cruza vigencias presupuestales — AT-06."
				alertCode="AT-06"
				columns={COLUMNS}
				rows={rows}
				loading={loading}
				methodology={METHODOLOGY["AT-06"]}
				exportFileName="alertas-at-06.csv"
				mockBanner={!!data.mock}
			/>
		</Stack>
	);
}
