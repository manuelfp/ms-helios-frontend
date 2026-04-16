import { useEffect, useState } from "react";

import { Link as RouterLink } from "react-router-dom";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { Iconify } from "@/components/core";
import { AlertDetailView } from "@/components/alertas/AlertDetailView";
import { AlertFilterBar } from "@/components/alertas/AlertFilterBar";
import { METHODOLOGY } from "@/services/mock-alerts";
import { getAlertSingleBidder } from "@/services/helios-api";
import { useAlertFilters } from "@/hooks/useAlertFilters";
import { paths } from "@/paths";

const COLUMNS = [
	{ key: "id_contrato", label: "ID Contrato", maxWidth: 180 },
	{ key: "modalidad_de_contratacion", label: "Modalidad", maxWidth: 220 },
	{ key: "proveedores_unicos_con", label: "Oferentes", align: "right", format: "number" },
	{ key: "nombre_entidad", label: "Entidad", maxWidth: 260 },
	{ key: "fuerza", label: "Fuerza" },
	{ key: "valor_del_contrato", label: "Valor", align: "right", format: "currency" },
];

export default function AlertasAt01Page() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState({ rows: [] });
	const { ano, setAno, anios, params, buildLink } = useAlertFilters();

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		getAlertSingleBidder(params)
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
			<Button
				component={RouterLink}
				to={buildLink(paths.dashboard.alertas)}
				size="small"
				startIcon={<Iconify icon="solar:arrow-left-bold-duotone" width={18} />}
				variant="text"
			>
				Volver al resumen de alertas
			</Button>
			<AlertFilterBar ano={ano} setAno={setAno} anios={anios} compact />
			<AlertDetailView
				title="Único oferente en procesos competitivos"
				subtitle="Contratos con un solo oferente en modalidades que requieren pluralidad (AT-01)."
				alertCode="AT-01"
				columns={COLUMNS}
				rows={data.rows || []}
				loading={loading}
				methodology={METHODOLOGY["AT-01"]}
				exportFileName="alertas-at-01.csv"
				mockBanner={!!data.mock}
			/>
		</Stack>
	);
}
