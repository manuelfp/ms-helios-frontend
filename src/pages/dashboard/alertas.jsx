import { useEffect, useMemo, useState } from "react";

import { Link as RouterLink } from "react-router-dom";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { Iconify } from "@/components/core";
import { AlertFilterBar } from "@/components/alertas/AlertFilterBar";
import { ALERT_TYPE_CARDS } from "@/services/mock-alerts";
import { getAlertsSummary, getAlertRiskScore } from "@/services/helios-api";
import { useAlertFilters } from "@/hooks/useAlertFilters";
import { paths } from "@/paths";
import { fCurrency, fNumber } from "@/utils/format";

const ALERT_PATHS = {
	"AT-01": paths.dashboard.alertasAt01,
	"AT-02": paths.dashboard.alertasAt02,
	"AT-03": paths.dashboard.alertasAt03,
	"AT-04": paths.dashboard.alertasAt04,
	"AT-05": paths.dashboard.alertasAt05,
	"AT-06": paths.dashboard.alertasAt06,
	"AT-07": paths.dashboard.alertasAt07,
};

export default function AlertasDashboardPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [summary, setSummary] = useState(null);
	const [risk, setRisk] = useState(null);
	const { ano, fuerza, setAno, setFuerza, resetFilters, anios, fuerzas, params, buildLink } = useAlertFilters();

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		Promise.all([getAlertsSummary(params), getAlertRiskScore(params)])
			.then(([s, r]) => {
				if (!cancelled) {
					setSummary(s);
					setRisk(r);
				}
			})
			.catch((e) => {
				if (!cancelled) setError(e?.message || "Error al cargar alertas");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [ano, fuerza]);

	const isMock = summary?.meta?.mock || summary?.mock || risk?.mock;

	const porTipoChart = useMemo(() => {
		const list = summary?.por_tipo || [];
		return list.map((x) => ({
			name: x.codigo || x.name,
			total: x.total ?? x.count ?? 0,
		}));
	}, [summary]);

	const porFuerzaChart = useMemo(() => {
		const list = summary?.por_fuerza || [];
		return list.map((x) => ({
			name: x.fuerza || x.name,
			total: x.total ?? 0,
		}));
	}, [summary]);

	const topEntidades = summary?.top_entidades || [];
	const tendencia = summary?.tendencia_mensual || [];

	const kpis = summary?.kpis || {};

	return (
		<Stack spacing={3}>
			<Stack spacing={0.5}>
				<Typography variant="h4">Alertas tempranas</Typography>
				<Typography variant="body2" color="text.secondary">
					Resumen de banderas rojas y concentraciones atípicas según la metodología del Sector Defensa (datos
					SECOP / BigQuery).
				</Typography>
			</Stack>

			{error && <Alert severity="error">{error}</Alert>}
			{isMock && !error && (
				<Alert severity="info">
					Mostrando datos de demostración o respuesta parcial hasta que el backend exponga{" "}
					<code>/bigquery/alerts/*</code> en producción.
				</Alert>
			)}

			<AlertFilterBar
				ano={ano}
				fuerza={fuerza}
				setAno={setAno}
				setFuerza={setFuerza}
				resetFilters={resetFilters}
				anios={anios}
				fuerzas={fuerzas}
			/>

			{loading && (
				<Stack alignItems="center" py={4}>
					<CircularProgress />
				</Stack>
			)}

			{!loading && summary && (
				<>
					<Grid container spacing={2}>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<KpiCard icon="solar:danger-triangle-bold-duotone" label="Total alertas (registros)" value={fNumber(kpis.total_alertas ?? 0)} color="#E53935" />
						</Grid>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<KpiCard icon="solar:document-bold-duotone" label="Contratos afectados" value={fNumber(kpis.contratos_afectados ?? 0)} color="#2E3B4E" />
						</Grid>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<KpiCard icon="solar:user-bold-duotone" label="Proveedores señalados" value={fNumber(kpis.proveedores_senalados ?? 0)} color="#5C6BC0" />
						</Grid>
						<Grid size={{ xs: 12, sm: 6, md: 3 }}>
							<KpiCard icon="solar:wallet-money-bold-duotone" label="Valor en riesgo (est.)" value={fCurrency(kpis.valor_en_riesgo ?? 0)} color="#F2A900" />
						</Grid>
					</Grid>

					<Typography variant="h6" sx={{ mt: 1 }}>
						Explorar por tipo de alerta
					</Typography>
					<Grid container spacing={2}>
					{ALERT_TYPE_CARDS.map((a) => {
						const total = porTipoChart.find((p) => p.name === a.code)?.total ?? "—";
						const to = buildLink(ALERT_PATHS[a.code]);
							return (
								<Grid key={a.code} size={{ xs: 12, sm: 6, md: 4 }}>
									<Card variant="outlined" sx={{ height: "100%", borderRadius: 2 }}>
										<CardActionArea component={RouterLink} to={to} sx={{ height: "100%" }}>
											<CardContent>
												<Stack direction="row" spacing={1.5} alignItems="flex-start">
													<Box
														sx={{
															width: 44,
															height: 44,
															borderRadius: 1.5,
															display: "flex",
															alignItems: "center",
															justifyContent: "center",
															bgcolor: `${a.color}18`,
														}}
													>
														<Iconify icon={a.icon} width={26} sx={{ color: a.color }} />
													</Box>
													<Box sx={{ minWidth: 0, flex: 1 }}>
														<Typography variant="caption" color="text.secondary">
															{a.code}
														</Typography>
														<Typography variant="subtitle1" fontWeight={700}>
															{a.title}
														</Typography>
														<Typography variant="h5" sx={{ mt: 0.5 }}>
															{typeof total === "number" ? fNumber(total) : total}
														</Typography>
													</Box>
													<Iconify icon="solar:arrow-right-up-bold-duotone" width={20} color="action" />
												</Stack>
											</CardContent>
										</CardActionArea>
									</Card>
								</Grid>
							);
						})}
					</Grid>

					<Grid container spacing={2}>
						<Grid size={{ xs: 12, lg: 6 }}>
							<ChartCard title="Alertas por tipo">
								<ResponsiveContainer width="100%" height={280}>
									<BarChart data={porTipoChart} layout="vertical" margin={{ left: 8, right: 16 }}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis type="number" />
										<YAxis dataKey="name" type="category" width={56} tick={{ fontSize: 11 }} />
										<Tooltip />
										<Bar dataKey="total" fill="#2E3B4E" radius={[0, 4, 4, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</ChartCard>
						</Grid>
						<Grid size={{ xs: 12, lg: 6 }}>
							<ChartCard title="Por fuerza">
								<ResponsiveContainer width="100%" height={280}>
									<BarChart data={porFuerzaChart}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="name" tick={{ fontSize: 11 }} />
										<YAxis />
										<Tooltip />
										<Bar dataKey="total" fill="#4A6741" radius={[4, 4, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</ChartCard>
						</Grid>
						<Grid size={{ xs: 12, lg: 6 }}>
							<ChartCard title="Top entidades (alertas)">
								<ResponsiveContainer width="100%" height={280}>
									<BarChart data={topEntidades.map((e) => ({ name: e.nombre_entidad?.slice(0, 28) || "—", total: e.total }))} layout="vertical">
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis type="number" />
										<YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
										<Tooltip />
										<Bar dataKey="total" fill="#F2A900" radius={[0, 4, 4, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</ChartCard>
						</Grid>
						<Grid size={{ xs: 12, lg: 6 }}>
							<ChartCard title="Tendencia mensual (ejemplo)">
								<ResponsiveContainer width="100%" height={280}>
									<AreaChart data={tendencia}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis dataKey="mes" tick={{ fontSize: 10 }} />
										<YAxis />
										<Tooltip />
										<Area type="monotone" dataKey="total" stroke="#5C6BC0" fill="#5C6BC033" />
									</AreaChart>
								</ResponsiveContainer>
							</ChartCard>
						</Grid>
					</Grid>

					{(risk?.ranking_proveedores?.length > 0 || risk?.ranking_entidades?.length > 0) && (
						<Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
							<Typography variant="subtitle1" fontWeight={700} gutterBottom>
								Índice de riesgo — ranking
							</Typography>
							{risk?.ranking_proveedores?.length > 0 && (
							<Stack spacing={1}>
								{risk.ranking_proveedores.slice(0, 5).map((p, i) => (
									<Stack key={i} direction="row" justifyContent="space-between" alignItems="center">
										<Button
											component={RouterLink}
											to={paths.dashboard.perfilProveedor(p.codigo_proveedor)}
											size="small"
											variant="text"
											sx={{ justifyContent: "flex-start", textTransform: "none" }}
										>
											{p.proveedor_adjudicado || p.codigo_proveedor}
										</Button>
										<Typography variant="body2">
											Score {p.score} · {p.nivel}
										</Typography>
									</Stack>
								))}
							</Stack>
							)}
							{risk?.ranking_entidades?.length > 0 && (
								<>
									<Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
										Entidades destacadas
									</Typography>
									<Stack spacing={0.5}>
										{risk.ranking_entidades.slice(0, 4).map((e, j) => (
											<Button
												key={j}
												component={RouterLink}
												to={paths.dashboard.perfilEntidad(String(e.nit_entidad ?? e.nit))}
												size="small"
												variant="text"
												sx={{ justifyContent: "flex-start", textTransform: "none" }}
											>
												{e.nombre_entidad} — score {e.score}
											</Button>
										))}
									</Stack>
								</>
							)}
							<Button component={RouterLink} to={paths.dashboard.alertasAt01} sx={{ mt: 1 }} size="small">
								Ir a alertas detalladas
							</Button>
						</Card>
					)}
				</>
			)}
		</Stack>
	);
}

function KpiCard({ icon, label, value, color }) {
	return (
		<Card sx={{ height: "100%", borderRadius: 2 }}>
			<CardContent>
				<Stack direction="row" spacing={1.5} alignItems="center">
					<Box
						sx={{
							width: 48,
							height: 48,
							borderRadius: 2,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							bgcolor: `${color}14`,
						}}
					>
						<Iconify icon={icon} width={26} sx={{ color }} />
					</Box>
					<Box>
						<Typography variant="h5" fontWeight={700}>
							{value}
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{label}
						</Typography>
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
}

function ChartCard({ title, children }) {
	return (
		<Card variant="outlined" sx={{ borderRadius: 2, p: 2, height: "100%" }}>
			<Typography variant="subtitle2" color="text.secondary" gutterBottom>
				{title}
			</Typography>
			<Box sx={{ width: "100%", minHeight: 280 }}>{children}</Box>
		</Card>
	);
}
