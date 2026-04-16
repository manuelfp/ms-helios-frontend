import { useEffect, useMemo, useState } from "react";

import { Link as RouterLink } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AlertDetailView } from "@/components/alertas/AlertDetailView";
import { AlertFilterBar } from "@/components/alertas/AlertFilterBar";
import { GraphViewer } from "@/components/core/graph-viewer";
import { METHODOLOGY } from "@/services/mock-alerts";
import { getAlertConcentrationCity } from "@/services/helios-api";
import { useAlertFilters } from "@/hooks/useAlertFilters";
import { paths } from "@/paths";

const COLUMNS = [
	{ key: "codigo_proveedor", label: "Cód. proveedor" },
	{ key: "proveedor_adjudicado", label: "Proveedor", maxWidth: 260 },
	{ key: "ciudad", label: "Ciudad" },
	{ key: "participacion_pct", label: "Participación %", align: "right", format: "percent" },
	{ key: "valor_total", label: "Valor acumulado", align: "right", format: "currency" },
];

export default function AlertasAt04Page() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState({ rows: [], graph: null });
	const { ano, setAno, anios, params, buildLink } = useAlertFilters();

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		getAlertConcentrationCity(params)
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

	const chartData = useMemo(
		() =>
			(data.rows || []).map((r) => ({
				name: (r.ciudad || "").slice(0, 20),
				participacion: Number(r.participacion_pct) || 0,
			})),
		[data.rows],
	);

	return (
		<Stack spacing={2}>
			<Button component={RouterLink} to={buildLink(paths.dashboard.alertas)} size="small" variant="text">
				← Volver al resumen de alertas
			</Button>
			<AlertFilterBar ano={ano} setAno={setAno} anios={anios} compact />
			<AlertDetailView
				title="Concentración proveedor × ciudad"
				subtitle="Participación atípica del proveedor en el mercado local (ciudad) — AT-04."
				alertCode="AT-04"
				columns={COLUMNS}
				rows={data.rows || []}
				loading={loading}
				methodology={METHODOLOGY["AT-04"]}
				exportFileName="alertas-at-04.csv"
				mockBanner={!!data.mock}
				graphSlot={
					data.graph?.nodes?.length ? (
						<Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
							<Typography variant="subtitle2" gutterBottom>
								Relaciones (demostración)
							</Typography>
							<GraphViewer data={data.graph} height={360} />
						</Card>
					) : null
				}
			>
				{chartData.length > 0 && (
					<Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>
							Participación por ciudad (%)
						</Typography>
						<Box sx={{ width: "100%", height: 260 }}>
							<ResponsiveContainer>
								<BarChart data={chartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" tick={{ fontSize: 10 }} />
									<YAxis />
									<Tooltip />
									<Bar dataKey="participacion" fill="#29B6F6" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</Box>
					</Card>
				)}
			</AlertDetailView>
		</Stack>
	);
}
