import { useState, useEffect, useCallback, useRef } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Fade from "@mui/material/Fade";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Legend,
	AreaChart,
	Area,
	CartesianGrid,
} from "recharts";

import { dashboardStream, getCatalogAnios } from "@/services/helios-api";
import { Iconify } from "@/components/core";
import { usePrivacy } from "@/hooks/use-privacy";
import { fCurrency, fNumber, maskDoc, maskName } from "@/utils/format";

// ─── Theme constants ────────────────────────────────────────────────

const PRIMARY = "#2E3B4E";
const SECONDARY = "#F2A900";
const SUCCESS = "#4A6741";

const PIE_COLORS = [PRIMARY, SECONDARY, SUCCESS, "#5B8DBE", "#D4552A", "#7C5295", "#2A9D8F", "#E76F51", "#8D6E63", "#78909C"];

const STAT_CARDS = [
	{ key: "total_contratos", label: "Total Contratos", icon: "mdi:file-document-outline", color: PRIMARY },
	{ key: "monto_total", label: "Monto Total", icon: "mdi:cash-multiple", color: SECONDARY, isCurrency: true },
	{ key: "total_proveedores", label: "Proveedores", icon: "mdi:account-group-outline", color: SUCCESS },
	{ key: "total_entidades", label: "Entidades", icon: "mdi:domain", color: "#5B8DBE" },
	{ key: "total_departamentos", label: "Departamentos", icon: "mdi:map-marker-radius-outline", color: "#D4552A" },
	{ key: "total_ciudades", label: "Ciudades", icon: "mdi:city-variant-outline", color: "#7C5295" },
];

const KPI_KEYS = [
	"anio_consultado",
	"resumen_general",
	"contratos_por_fuerza",
	"contratos_por_estado",
	"contratos_por_tipo",
	"contratos_por_modalidad",
	"contratos_por_departamento",
	"top_proveedores_pais",
	"sanciones",
	"tendencias_historicas",
];

// ─── Reusable UI pieces ─────────────────────────────────────────────

function StatCard({ icon, value, label, color }) {
	return (
		<Card sx={{ height: "100%", borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }}>
			<CardContent>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Box
						sx={{
							width: 56,
							height: 56,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							borderRadius: 2,
							bgcolor: `${color}14`,
						}}
					>
						<Iconify icon={icon} width={28} sx={{ color }} />
					</Box>
					<Box sx={{ minWidth: 0 }}>
						<Typography variant="h5" fontWeight={700} noWrap>
							{value}
						</Typography>
						<Typography variant="body2" color="text.secondary" noWrap>
							{label}
						</Typography>
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
}

function StatCardSkeleton() {
	return (
		<Card sx={{ height: "100%", borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }}>
			<CardContent>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Skeleton variant="rounded" width={56} height={56} />
					<Box sx={{ flex: 1 }}>
						<Skeleton variant="text" width="60%" height={32} />
						<Skeleton variant="text" width="40%" height={18} />
					</Box>
				</Stack>
			</CardContent>
		</Card>
	);
}

function ChartCard({ title, children, sx }) {
	return (
		<Card sx={{ height: "100%", borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)", ...sx }}>
			<CardContent sx={{ height: "100%" }}>
				<Typography variant="subtitle1" fontWeight={600} mb={2}>
					{title}
				</Typography>
				{children}
			</CardContent>
		</Card>
	);
}

function ChartSkeleton({ height = 320 }) {
	return <Skeleton variant="rounded" width="100%" height={height} />;
}

function CustomTooltip({ active, payload, label, isCurrency }) {
	if (!active || !payload?.length) return null;
	return (
		<Box sx={{ bgcolor: "background.paper", p: 1.5, borderRadius: 1, boxShadow: 3 }}>
			<Typography variant="caption" fontWeight={600}>
				{label}
			</Typography>
			{payload.map((entry) => (
				<Typography key={entry.name} variant="body2" sx={{ color: entry.color }}>
					{entry.name}: {isCurrency ? fCurrency(entry.value) : fNumber(entry.value)}
				</Typography>
			))}
		</Box>
	);
}

function truncate(str, max = 30) {
	if (!str) return "";
	return str.length > max ? `${str.slice(0, max)}…` : str;
}

// ─── Main page ──────────────────────────────────────────────────────

export default function OverviewPage() {
	const { obfuscate, visibleChars, visibleLastChars, maskChar } = usePrivacy();

	const [selectedYear, setSelectedYear] = useState(2025);
	const [anios, setAnios] = useState([]);

	// KPI state — each key populated independently as SSE events arrive
	const [kpis, setKpis] = useState({});
	const [streaming, setStreaming] = useState(false);
	const [error, setError] = useState(null);
	const [receivedKeys, setReceivedKeys] = useState(new Set());

	const abortRef = useRef(null);

	useEffect(() => {
		getCatalogAnios()
			.then((res) => {
				const list = Array.isArray(res) ? res : res?.data || [];
				setAnios(list.sort((a, b) => b - a));
			})
			.catch(() => {});
	}, []);

	const startStream = useCallback((year) => {
		abortRef.current?.abort();
		const ctrl = new AbortController();
		abortRef.current = ctrl;

		setKpis({});
		setReceivedKeys(new Set());
		setStreaming(true);
		setError(null);

		dashboardStream(
			year || undefined,
			{
				cache_hit() {},
				dashboard_start() {},
				kpi_start() {},

				kpi(payload) {
					if (payload.key && payload.data !== undefined) {
						setKpis((prev) => ({ ...prev, [payload.key]: payload.data }));
						setReceivedKeys((prev) => new Set(prev).add(payload.key));
					}
				},

				complete() {},
			},
			ctrl.signal,
		)
			.catch((err) => {
				if (err.name !== "AbortError") {
					setError(err.message || "Error al cargar el dashboard");
				}
			})
			.finally(() => {
				setStreaming(false);
			});
	}, []);

	useEffect(() => {
		startStream(selectedYear);
		return () => { abortRef.current?.abort(); };
	}, [selectedYear, startStream]);

	// Derived data
	const resumen = kpis.resumen_general || {};
	const anioConsultado = kpis.anio_consultado;
	const sanciones = kpis.sanciones || {};
	const sancionesGeneral = sanciones.general || sanciones.disciplinarias || {};
	const sancionesDefensa = sanciones.sector_defensa || sanciones.fiscales || {};
	const totalSanciones =
		(sancionesGeneral.total_sanciones || 0) +
		(sancionesDefensa.total_sanciones || 0);

	const tendencias = kpis.tendencias_historicas || {};
	const contratosPorAnio = tendencias.contratos_por_anio || [];
	const montosPorAnio = tendencias.montos_por_anio || [];
	const contratosPorFuerza = kpis.contratos_por_fuerza || [];
	const contratosPorEstado = kpis.contratos_por_estado || [];
	const sortedTipo = [...(kpis.contratos_por_tipo || [])].sort((a, b) => b.total_contratos - a.total_contratos).slice(0, 10);
	const sortedModalidad = [...(kpis.contratos_por_modalidad || [])].sort((a, b) => b.total_contratos - a.total_contratos).slice(0, 10);
	const contratosPorDepartamento = [...(kpis.contratos_por_departamento || [])].sort((a, b) => b.total_contratos - a.total_contratos).slice(0, 15);
	const topProveedores = (kpis.top_proveedores_pais || []).slice(0, 10);

	const has = (key) => receivedKeys.has(key);
	const progressPct = KPI_KEYS.length > 0
		? Math.round((receivedKeys.size / KPI_KEYS.length) * 100)
		: 0;

	function getStatValue(key) {
		if (key === "monto_total") return fCurrency(resumen.monto_total);
		return fNumber(resumen[key]);
	}

	return (
		<Box sx={{ p: { xs: 2, md: 3 } }}>
			{/* Header */}
			<Stack
				direction={{ xs: "column", sm: "row" }}
				justifyContent="space-between"
				alignItems={{ sm: "center" }}
				spacing={2}
				mb={3}
			>
				<Box>
					<Typography variant="h4" fontWeight={700} color={PRIMARY}>
						Portal Helios
					</Typography>
					<Typography variant="body2" color="text.secondary">
						Panel de transparencia contractual
						{anioConsultado ? ` — Año ${anioConsultado}` : ""}
					</Typography>
				</Box>

				<Stack direction="row" spacing={2} alignItems="center">
					{streaming && (
						<Stack direction="row" spacing={1} alignItems="center">
							<CircularProgress size={18} thickness={5} />
							<Typography variant="caption" color="text.secondary">
								Cargando KPIs… {progressPct}%
							</Typography>
						</Stack>
					)}
					<FormControl size="small" sx={{ minWidth: 160 }}>
						<InputLabel>Año</InputLabel>
						<Select
							value={selectedYear}
							label="Año"
							onChange={(e) => setSelectedYear(e.target.value)}
							disabled={streaming}
						>
							<MenuItem value="">Todos los años</MenuItem>
							{anios.map((y) => (
								<MenuItem key={y} value={y}>{y}</MenuItem>
							))}
						</Select>
					</FormControl>
				</Stack>
			</Stack>

			{/* Progress bar */}
			{streaming && (
				<LinearProgress
					variant="determinate"
					value={progressPct}
					sx={{ mb: 2, height: 4, borderRadius: 2 }}
				/>
			)}

			{error && (
				<Alert severity="error" sx={{ mb: 3, maxWidth: 600, mx: "auto" }}>{error}</Alert>
			)}

			{/* ─── Stat Cards ─────────────────────────── */}
			<Grid container spacing={2} mb={3}>
				{STAT_CARDS.map((card) => (
					<Grid key={card.key} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
						{has("resumen_general") ? (
							<Fade in timeout={500}>
								<div>
									<StatCard icon={card.icon} value={getStatValue(card.key)} label={card.label} color={card.color} />
								</div>
							</Fade>
						) : (
							<StatCardSkeleton />
						)}
					</Grid>
				))}
			</Grid>

			{/* ─── Sanciones ribbon ───────────────────── */}
			{has("sanciones") && totalSanciones > 0 && (
				<Fade in timeout={500}>
					<Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }}>
						<CardContent>
							<Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center" justifyContent="space-around">
								<Stack direction="row" spacing={1} alignItems="center">
									<Iconify icon="mdi:gavel" width={24} sx={{ color: "#D4552A" }} />
									<Box>
										<Typography variant="h6" fontWeight={700} color="#D4552A">{fNumber(totalSanciones)}</Typography>
										<Typography variant="caption" color="text.secondary">Total Sanciones</Typography>
									</Box>
								</Stack>
								<Stack direction="row" spacing={1} alignItems="center">
									<Iconify icon="mdi:account-alert-outline" width={24} sx={{ color: "#EF5350" }} />
									<Box>
										<Typography variant="h6" fontWeight={700}>{fNumber(sancionesGeneral.total_sanciones || 0)}</Typography>
										<Typography variant="caption" color="text.secondary">Generales</Typography>
									</Box>
								</Stack>
								<Stack direction="row" spacing={1} alignItems="center">
									<Iconify icon="mdi:shield-alert-outline" width={24} sx={{ color: "#FF7043" }} />
									<Box>
										<Typography variant="h6" fontWeight={700}>{fNumber(sancionesDefensa.total_sanciones || 0)}</Typography>
										<Typography variant="caption" color="text.secondary">Sector Defensa</Typography>
									</Box>
								</Stack>
								{(sancionesGeneral.valor_total || sancionesDefensa.valor_total) && (
									<Stack direction="row" spacing={1} alignItems="center">
										<Iconify icon="mdi:cash-multiple" width={24} sx={{ color: "#7C5295" }} />
										<Box>
											<Typography variant="h6" fontWeight={700}>{fCurrency((sancionesGeneral.valor_total || 0) + (sancionesDefensa.valor_total || 0))}</Typography>
											<Typography variant="caption" color="text.secondary">Valor Total Sanciones</Typography>
										</Box>
									</Stack>
								)}
							</Stack>
						</CardContent>
					</Card>
				</Fade>
			)}

			{/* ─── Tendencias históricas ──────────────── */}
			<Grid container spacing={2} mb={3}>
				<Grid size={{ xs: 12, md: 6 }}>
					{has("tendencias_historicas") ? (
						<Fade in timeout={500}>
							<div>
								<ChartCard title="Contratos por Año">
									<ResponsiveContainer width="100%" height={320}>
										<BarChart data={contratosPorAnio} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="anio" tick={{ fontSize: 12 }} />
											<YAxis tick={{ fontSize: 12 }} tickFormatter={fNumber} />
											<Tooltip content={<CustomTooltip />} />
											<Bar dataKey="total_contratos" name="Contratos" fill={PRIMARY} radius={[4, 4, 0, 0]} />
										</BarChart>
									</ResponsiveContainer>
								</ChartCard>
							</div>
						</Fade>
					) : (
						<ChartCard title="Contratos por Año"><ChartSkeleton /></ChartCard>
					)}
				</Grid>

				<Grid size={{ xs: 12, md: 6 }}>
					{has("tendencias_historicas") ? (
						<Fade in timeout={500}>
							<div>
								<ChartCard title="Montos Ejecutados por Año">
									<ResponsiveContainer width="100%" height={320}>
										<AreaChart data={montosPorAnio} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="anio" tick={{ fontSize: 12 }} />
											<YAxis tick={{ fontSize: 12 }} tickFormatter={fCurrency} width={70} />
											<Tooltip content={<CustomTooltip isCurrency />} />
											<Area type="monotone" dataKey="monto_total" name="Monto Total" stroke={SECONDARY} fill={SECONDARY} fillOpacity={0.15} />
										</AreaChart>
									</ResponsiveContainer>
								</ChartCard>
							</div>
						</Fade>
					) : (
						<ChartCard title="Montos Ejecutados por Año"><ChartSkeleton /></ChartCard>
					)}
				</Grid>
			</Grid>

			{/* ─── Fuerza + Estado (Pie charts) ──────── */}
			<Grid container spacing={2} mb={3}>
				<Grid size={{ xs: 12, md: 6 }}>
					{has("contratos_por_fuerza") ? (
						<Fade in timeout={500}>
							<div>
								<ChartCard title="Contratos por Fuerza">
									<ResponsiveContainer width="100%" height={340}>
										<PieChart>
											<Pie
												data={contratosPorFuerza}
												dataKey="total_contratos"
												nameKey="fuerza"
												cx="50%"
												cy="50%"
												outerRadius={110}
												innerRadius={55}
												paddingAngle={2}
												label={({ fuerza, percent }) => `${(fuerza || "").slice(0, 12)} ${(percent * 100).toFixed(0)}%`}
											>
												{contratosPorFuerza.map((_, i) => (
													<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(value) => fNumber(value)} />
											<Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
										</PieChart>
									</ResponsiveContainer>
								</ChartCard>
							</div>
						</Fade>
					) : (
						<ChartCard title="Contratos por Fuerza"><ChartSkeleton height={340} /></ChartCard>
					)}
				</Grid>

				<Grid size={{ xs: 12, md: 6 }}>
					{has("contratos_por_estado") ? (
						<Fade in timeout={500}>
							<div>
								<ChartCard title="Contratos por Estado">
									<ResponsiveContainer width="100%" height={340}>
										<PieChart>
											<Pie
												data={contratosPorEstado}
												dataKey="total_contratos"
												nameKey="estado"
												cx="50%"
												cy="50%"
												outerRadius={110}
												innerRadius={55}
												paddingAngle={2}
												label={({ estado, percent }) => `${(estado || "").slice(0, 14)} ${(percent * 100).toFixed(0)}%`}
											>
												{contratosPorEstado.map((_, i) => (
													<Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
												))}
											</Pie>
											<Tooltip formatter={(value) => fNumber(value)} />
											<Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
										</PieChart>
									</ResponsiveContainer>
								</ChartCard>
							</div>
						</Fade>
					) : (
						<ChartCard title="Contratos por Estado"><ChartSkeleton height={340} /></ChartCard>
					)}
				</Grid>
			</Grid>

			{/* ─── Tipo (horizontal bar) ─────────────── */}
			{has("contratos_por_tipo") ? (
				sortedTipo.length > 0 && (
					<Fade in timeout={500}>
						<Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }}>
							<CardContent>
								<Typography variant="subtitle1" fontWeight={600} mb={2}>Top 10 — Contratos por Tipo</Typography>
								<ResponsiveContainer width="100%" height={Math.max(300, sortedTipo.length * 38)}>
									<BarChart data={sortedTipo} layout="vertical" margin={{ left: 20, right: 20 }}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis type="number" tickFormatter={fNumber} />
										<YAxis dataKey="tipo" type="category" width={240} tick={{ fontSize: 11 }} tickFormatter={(v) => truncate(v, 40)} />
										<Tooltip content={<CustomTooltip />} />
										<Bar dataKey="total_contratos" name="Contratos" fill={PRIMARY} radius={[0, 4, 4, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</Fade>
				)
			) : (
				<Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }}>
					<CardContent>
						<Typography variant="subtitle1" fontWeight={600} mb={2}>Top 10 — Contratos por Tipo</Typography>
						<ChartSkeleton height={340} />
					</CardContent>
				</Card>
			)}

			{/* ─── Modalidad (horizontal bar) ────────── */}
			{has("contratos_por_modalidad") ? (
				sortedModalidad.length > 0 && (
					<Fade in timeout={500}>
						<Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }}>
							<CardContent>
								<Typography variant="subtitle1" fontWeight={600} mb={2}>Top 10 — Contratos por Modalidad</Typography>
								<ResponsiveContainer width="100%" height={Math.max(300, sortedModalidad.length * 38)}>
									<BarChart data={sortedModalidad} layout="vertical" margin={{ left: 20, right: 20 }}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis type="number" tickFormatter={fNumber} />
										<YAxis dataKey="modalidad" type="category" width={280} tick={{ fontSize: 11 }} tickFormatter={(v) => truncate(v, 48)} />
										<Tooltip content={<CustomTooltip />} />
										<Bar dataKey="total_contratos" name="Contratos" fill={SECONDARY} radius={[0, 4, 4, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</Fade>
				)
			) : (
				<Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }}>
					<CardContent>
						<Typography variant="subtitle1" fontWeight={600} mb={2}>Top 10 — Contratos por Modalidad</Typography>
						<ChartSkeleton height={340} />
					</CardContent>
				</Card>
			)}

			{/* ─── Top Departamentos (bar horizontal) ── */}
			{has("contratos_por_departamento") ? (
				contratosPorDepartamento.length > 0 && (
					<Fade in timeout={500}>
						<Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }}>
							<CardContent>
								<Typography variant="subtitle1" fontWeight={600} mb={2}>
									Top 15 Departamentos por Contratos
								</Typography>
								<ResponsiveContainer width="100%" height={Math.max(450, contratosPorDepartamento.length * 32)}>
									<BarChart data={contratosPorDepartamento} layout="vertical" margin={{ left: 20 }}>
										<CartesianGrid strokeDasharray="3 3" />
										<XAxis type="number" tickFormatter={fNumber} />
										<YAxis dataKey="departamento" type="category" width={200} tick={{ fontSize: 11 }} tickFormatter={(v) => truncate(v, 35)} />
										<Tooltip content={<CustomTooltip />} />
										<Bar dataKey="total_contratos" name="Contratos" fill={SUCCESS} radius={[0, 4, 4, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</CardContent>
						</Card>
					</Fade>
				)
			) : (
				<Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.08)" }}>
					<CardContent>
						<Typography variant="subtitle1" fontWeight={600} mb={2}>Top 15 Departamentos por Contratos</Typography>
						<ChartSkeleton height={450} />
					</CardContent>
				</Card>
			)}

			{/* ─── Top Proveedores table ─────────────── */}
			{has("top_proveedores_pais") ? (
				<Fade in timeout={500}>
					<div>
						<Grid container spacing={2}>
							<Grid size={{ xs: 12 }}>
								<ChartCard title="Top 10 Proveedores del País">
									<TableContainer sx={{ maxHeight: 420 }}>
										<Table size="small" stickyHeader>
											<TableHead>
												<TableRow>
													<TableCell sx={{ fontWeight: 600 }}>#</TableCell>
													<TableCell sx={{ fontWeight: 600 }}>Proveedor</TableCell>
													<TableCell sx={{ fontWeight: 600 }}>Documento</TableCell>
													<TableCell sx={{ fontWeight: 600 }} align="right">Contratos</TableCell>
													<TableCell sx={{ fontWeight: 600 }} align="right">Monto Total</TableCell>
													<TableCell sx={{ fontWeight: 600 }} align="right">Entidades</TableCell>
													<TableCell sx={{ fontWeight: 600 }} align="right">Departamentos</TableCell>
													<TableCell sx={{ fontWeight: 600 }} align="right">Ciudades</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{topProveedores.map((row, idx) => (
													<TableRow key={row.documento || idx} hover>
														<TableCell>{idx + 1}</TableCell>
														<TableCell sx={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
															{obfuscate ? maskName(row.proveedor, visibleChars, maskChar) : row.proveedor}
														</TableCell>
														<TableCell>{obfuscate ? maskDoc(row.documento, visibleLastChars, maskChar) : row.documento}</TableCell>
														<TableCell align="right">{fNumber(row.total_contratos)}</TableCell>
														<TableCell align="right">{fCurrency(row.monto_total)}</TableCell>
														<TableCell align="right">{fNumber(row.total_entidades)}</TableCell>
														<TableCell align="right">{fNumber(row.total_departamentos)}</TableCell>
														<TableCell align="right">{fNumber(row.total_ciudades)}</TableCell>
													</TableRow>
												))}

												{topProveedores.length === 0 && (
													<TableRow>
														<TableCell colSpan={8} align="center" sx={{ py: 4 }}>
															<Typography variant="body2" color="text.secondary">Sin datos disponibles</Typography>
														</TableCell>
													</TableRow>
												)}
											</TableBody>
										</Table>
									</TableContainer>
								</ChartCard>
							</Grid>
						</Grid>
					</div>
				</Fade>
			) : (
				<Grid container spacing={2}>
					<Grid size={{ xs: 12 }}>
						<ChartCard title="Top 10 Proveedores del País">
							<Skeleton variant="rounded" width="100%" height={300} />
						</ChartCard>
					</Grid>
				</Grid>
			)}
		</Box>
	);
}
