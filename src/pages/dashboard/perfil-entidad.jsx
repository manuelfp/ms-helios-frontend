import { useEffect, useState } from "react";

import { Link as RouterLink, useParams } from "react-router-dom";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { RiskBadge } from "@/components/alertas/RiskBadge";
import { GraphViewer } from "@/components/core/graph-viewer";
import { DataSourceBadge, Iconify } from "@/components/core";
import { ReconciliationPanel } from "@/components/core/reconciliation-panel";
import { getEntityAlertProfile, getReconciliation } from "@/services/helios-api";
import { paths } from "@/paths";
import { fNumber } from "@/utils/format";

export default function PerfilEntidadPage() {
	const { nit } = useParams();
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [reconLoading, setReconLoading] = useState(false);
	const [recon, setRecon] = useState(null);
	const [reconError, setReconError] = useState(null);

	useEffect(() => {
		if (!nit) return;
		let cancelled = false;
		setLoading(true);
		setError(null);
		getEntityAlertProfile(nit, {})
			.then((d) => {
				if (!cancelled) setData(d);
			})
			.catch((e) => {
				if (!cancelled) setError(e?.message || "Error al cargar perfil");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [nit]);

	useEffect(() => {
		const doc = data?.nit_entidad != null ? String(data.nit_entidad) : nit;
		if (!doc) return;
		let cancelled = false;
		setReconLoading(true);
		setReconError(null);
		getReconciliation(doc)
			.then((r) => {
				if (!cancelled) setRecon(r);
			})
			.catch((e) => {
				if (!cancelled) setReconError(e?.message || "No se pudo cargar la conciliación");
			})
			.finally(() => {
				if (!cancelled) setReconLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [data?.nit_entidad, nit]);

	const modalidadChart = (data?.distribucion_modalidad || []).map((x) => ({
		name: (x.modalidad || "").slice(0, 24),
		total: x.total ?? 0,
	}));

	return (
		<Stack spacing={3}>
			<Button component={RouterLink} to={paths.dashboard.alertas} size="small" variant="text" startIcon={<Iconify icon="solar:arrow-left-bold-duotone" width={18} />}>
				Volver a alertas
			</Button>

			{error && <Alert severity="error">{error}</Alert>}

			{loading && <Typography>Cargando perfil…</Typography>}

			{!loading && data && (
				<>
					<Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "flex-start" }} justifyContent="space-between">
						<Box>
							<Typography variant="h4" gutterBottom>
								{data.nombre_entidad || "Entidad"}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								NIT: <strong>{String(data.nit_entidad ?? nit)}</strong>
								{data.fuerza && (
									<>
										{" · "}
										Fuerza: <strong>{data.fuerza}</strong>
									</>
								)}
							</Typography>
						</Box>
						<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
							<DataSourceBadge meta={data._meta} />
							<RiskBadge nivel={data.nivel_riesgo} score={data.score} size="medium" />
							{data.mock && <Chip size="small" label="Datos demo" color="info" variant="outlined" />}
						</Stack>
					</Stack>

					<Grid container spacing={2}>
						<Grid size={{ xs: 12, md: 6 }}>
							<Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
								<CardContent>
									<Typography variant="subtitle1" fontWeight={700} gutterBottom>
										Proveedores con alertas (muestra)
									</Typography>
									<Table size="small">
										<TableHead>
											<TableRow>
												<TableCell>Proveedor</TableCell>
												<TableCell align="right">Participación %</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{(data.proveedores_con_alertas || []).map((p, i) => {
												const docRaw = p.codigo_proveedor;
												const hasDoc = docRaw != null && String(docRaw).trim() !== "" && !/^0+$/.test(String(docRaw).trim());
												const label = p.proveedor_adjudicado || (hasDoc ? String(docRaw) : "Sin identificación");
												return (
													<TableRow key={i}>
														<TableCell>
															{hasDoc ? (
																<Button
																	component={RouterLink}
																	to={paths.dashboard.perfilProveedor(String(docRaw))}
																	size="small"
																	variant="text"
																	sx={{ textTransform: "none", p: 0, minWidth: 0 }}
																>
																	{label}
																</Button>
															) : (
																<Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
																	{label}
																</Typography>
															)}
														</TableCell>
														<TableCell align="right">{fNumber(p.participacion_pct)}%</TableCell>
													</TableRow>
												);
											})}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
								<CardContent>
									<Typography variant="subtitle1" fontWeight={700} gutterBottom>
										Contratos por modalidad (muestra)
									</Typography>
									{modalidadChart.length > 0 ? (
										<Box sx={{ width: "100%", height: 260 }}>
											<ResponsiveContainer>
												<BarChart data={modalidadChart}>
													<CartesianGrid strokeDasharray="3 3" />
													<XAxis dataKey="name" tick={{ fontSize: 9 }} />
													<YAxis />
													<Tooltip />
													<Bar dataKey="total" fill="#2E3B4E" radius={[4, 4, 0, 0]} />
												</BarChart>
											</ResponsiveContainer>
										</Box>
									) : (
										<Typography variant="body2" color="text.secondary">
											Sin distribución disponible.
										</Typography>
									)}
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					<ReconciliationPanel data={recon} loading={reconLoading} error={reconError} />

					{data.graph?.nodes?.length > 0 && (
						<Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
							<Typography variant="subtitle1" fontWeight={700} gutterBottom>
								Red de relaciones (demostración)
							</Typography>
							<GraphViewer data={data.graph} height={420} />
						</Card>
					)}
				</>
			)}
		</Stack>
	);
}
