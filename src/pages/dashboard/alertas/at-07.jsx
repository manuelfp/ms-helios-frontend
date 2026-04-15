import { useEffect, useMemo, useState } from "react";

import { Link as RouterLink } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { AlertDetailView } from "@/components/alertas/AlertDetailView";
import { METHODOLOGY } from "@/services/mock-alerts";
import { getAlertHeterogeneousSupplier } from "@/services/helios-api";
import { paths } from "@/paths";

const COLUMNS = [
	{ key: "codigo_proveedor", label: "Cód. proveedor" },
	{ key: "proveedor_adjudicado", label: "Proveedor", maxWidth: 280 },
	{ key: "categorias_distintas", label: "Categorías UNSPSC", align: "right", format: "number" },
	{ key: "umbral", label: "Umbral IQR", align: "right", format: "number" },
	{ key: "variedad_sobre_umbral", label: "Sobre umbral" },
];

export default function AlertasAt07Page() {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState({ rows: [] });

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		getAlertHeterogeneousSupplier({})
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
		variedad_sobre_umbral: r.variedad_sobre_umbral ? "Sí" : "No",
	}));

	const chartData = useMemo(
		() =>
			rows.map((r) => ({
				name: (r.proveedor_adjudicado || r.codigo_proveedor || "").slice(0, 22),
				categorias: Number(r.categorias_distintas) || 0,
				umbral: Number(r.umbral) || 0,
			})),
		[rows],
	);

	return (
		<Stack spacing={2}>
			<Button component={RouterLink} to={paths.dashboard.alertas} size="small" variant="text">
				← Volver al resumen de alertas
			</Button>
			<AlertDetailView
				title="Proveedores con múltiples categorías UNSPSC"
				subtitle="Variedad atípica de segmentos de compra por proveedor — AT-07."
				alertCode="AT-07"
				columns={COLUMNS}
				rows={rows}
				loading={loading}
				methodology={METHODOLOGY["AT-07"]}
				exportFileName="alertas-at-07.csv"
				mockBanner={!!data.mock}
			>
				{chartData.length > 0 && (
					<Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
						<Typography variant="subtitle2" color="text.secondary" gutterBottom>
							Categorías distintas vs umbral
						</Typography>
						<Box sx={{ width: "100%", height: 280 }}>
							<ResponsiveContainer>
								<BarChart data={chartData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="name" tick={{ fontSize: 9 }} />
									<YAxis />
									<Tooltip />
									<Bar dataKey="categorias" name="Categorías" fill="#43A047" radius={[4, 4, 0, 0]} />
									<Bar dataKey="umbral" name="Umbral" fill="#BDBDBD" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</Box>
					</Card>
				)}
			</AlertDetailView>
		</Stack>
	);
}
