import { useState, useEffect, useMemo } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";

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
	CartesianGrid,
	AreaChart,
	Area,
} from "recharts";

import {
	getDashboard,
	getMontosPorEntidad,
	getContratosPorProveedor,
	getMontosPorMes,
	getConcentracion,
	getCatalogAnios,
} from "@/services/helios-api";

import { Iconify } from "@/components/core";
import { fCurrency, fNumber } from "@/utils/format";

const CHART_COLORS = [
	"#2E3B4E", "#F2A900", "#4A6741", "#5C6BC0", "#EF5350",
	"#29B6F6", "#AB47BC", "#FF7043", "#66BB6A", "#26A69A",
];

function CurrencyTooltip({ active, payload, label }) {
	if (!active || !payload?.length) return null;
	return (
		<Paper sx={{ p: 1.5, boxShadow: 3 }}>
			<Typography variant="subtitle2" gutterBottom>{label}</Typography>
			{payload.map((entry, i) => (
				<Typography key={i} variant="body2" sx={{ color: entry.color }}>
					{entry.name}: {entry.name.toLowerCase().includes("monto") ? fCurrency(entry.value) : fNumber(entry.value)}
				</Typography>
			))}
		</Paper>
	);
}

function PieTooltip({ active, payload }) {
	if (!active || !payload?.length) return null;
	const d = payload[0];
	return (
		<Paper sx={{ p: 1.5, boxShadow: 3 }}>
			<Typography variant="subtitle2">{d.name}</Typography>
			<Typography variant="body2">Contratos: {fNumber(d.payload.total_contratos)}</Typography>
			<Typography variant="body2">Monto: {fCurrency(d.payload.monto_total)}</Typography>
		</Paper>
	);
}

function SectionLoader() {
	return (
		<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
			<CircularProgress />
		</Box>
	);
}

function SectionError({ message }) {
	return <Alert severity="error" sx={{ my: 2 }}>{message}</Alert>;
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function truncate(str, max = 40) {
	if (!str) return "";
	return str.length > max ? `${str.slice(0, max)}…` : str;
}

function useAsyncData(fetcher, deps = []) {
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);
		fetcher()
			.then((res) => { if (!cancelled) setData(res); })
			.catch((err) => { if (!cancelled) setError(err.message || "Error al cargar datos"); })
			.finally(() => { if (!cancelled) setLoading(false); });
		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

	return { data, loading, error };
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: Temporal — uses dashboard.tendencias_historicas + individual montos-por-mes
// ═══════════════════════════════════════════════════════════════════════
function TabTemporal({ dashboard, year }) {
	const tendencias = dashboard?.tendencias_historicas || {};
	const montosPorAnio = tendencias.montos_por_anio || [];
	const contratosPorAnio = tendencias.contratos_por_anio || [];

	const montosMes = useAsyncData(() => (year ? getMontosPorMes(year) : Promise.resolve(null)), [year]);

	const mesData = useMemo(() => {
		if (!montosMes.data) return [];
		return montosMes.data.map((d) => ({ ...d, mes_label: MONTH_NAMES[(d.mes || 1) - 1] || d.mes }));
	}, [montosMes.data]);

	return (
		<Stack spacing={3}>
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Evolución de Montos por Año</Typography>
					{montosPorAnio.length > 0 ? (
						<ResponsiveContainer width="100%" height={420}>
							<AreaChart data={montosPorAnio}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="anio" />
								<YAxis tickFormatter={fCurrency} width={80} />
								<Tooltip content={<CurrencyTooltip />} />
								<Area type="monotone" dataKey="monto_total" name="Monto Total" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.15} />
							</AreaChart>
						</ResponsiveContainer>
					) : (
						<Alert severity="info">Sin datos de tendencias históricas</Alert>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Contratos por Año</Typography>
					{contratosPorAnio.length > 0 ? (
						<ResponsiveContainer width="100%" height={380}>
							<BarChart data={contratosPorAnio}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="anio" />
								<YAxis tickFormatter={fNumber} width={70} />
								<Tooltip content={<CurrencyTooltip />} />
								<Bar dataKey="total_contratos" name="Total Contratos" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					) : (
						<Alert severity="info">Sin datos de contratos por año</Alert>
					)}
				</CardContent>
			</Card>

			{year && (
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>Montos por Mes — {year}</Typography>
						{montosMes.loading ? <SectionLoader /> : montosMes.error ? <SectionError message={montosMes.error} /> : (
							<ResponsiveContainer width="100%" height={380}>
								<BarChart data={mesData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="mes_label" />
									<YAxis tickFormatter={fCurrency} width={80} />
									<Tooltip content={<CurrencyTooltip />} />
									<Bar dataKey="monto_total" name="Monto Total" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>
			)}
		</Stack>
	);
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: Fuerzas — uses dashboard.contratos_por_fuerza
// ═══════════════════════════════════════════════════════════════════════
function TabFuerzas({ dashboard }) {
	const data = dashboard?.contratos_por_fuerza || [];
	const sorted = [...data].sort((a, b) => b.total_contratos - a.total_contratos);

	if (!sorted.length) return <Alert severity="info">Sin datos de fuerzas</Alert>;

	return (
		<Stack spacing={3}>
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Contratos por Fuerza</Typography>
					<ResponsiveContainer width="100%" height={Math.max(400, sorted.length * 45)}>
						<BarChart data={sorted} layout="vertical" margin={{ left: 20 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis type="number" tickFormatter={fNumber} />
							<YAxis dataKey="fuerza" type="category" width={120} tick={{ fontSize: 12 }} />
							<Tooltip content={<CurrencyTooltip />} />
							<Bar dataKey="total_contratos" name="Total Contratos" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Monto Total por Fuerza</Typography>
					<ResponsiveContainer width="100%" height={Math.max(400, sorted.length * 45)}>
						<BarChart data={sorted} layout="vertical" margin={{ left: 20 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis type="number" tickFormatter={fCurrency} />
							<YAxis dataKey="fuerza" type="category" width={120} tick={{ fontSize: 12 }} />
							<Tooltip content={<CurrencyTooltip />} />
							<Bar dataKey="monto_total" name="Monto Total" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Detalle por Fuerza</Typography>
					<TableContainer sx={{ maxHeight: 500 }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontWeight: 700 }}>Fuerza</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Contratos</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Monto Total</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Proveedores</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Entidades</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{sorted.map((row, i) => (
									<TableRow key={i} hover>
										<TableCell>{row.fuerza}</TableCell>
										<TableCell align="right">{fNumber(row.total_contratos)}</TableCell>
										<TableCell align="right">{fCurrency(row.monto_total)}</TableCell>
										<TableCell align="right">{fNumber(row.total_proveedores)}</TableCell>
										<TableCell align="right">{fNumber(row.total_entidades)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</CardContent>
			</Card>
		</Stack>
	);
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: Entidades — individual endpoint (not in dashboard)
// ═══════════════════════════════════════════════════════════════════════
function TabEntidades() {
	const { data, loading, error } = useAsyncData(() => getMontosPorEntidad(30), []);

	if (loading) return <SectionLoader />;
	if (error) return <SectionError message={error} />;

	const top15 = (data || []).slice(0, 15).sort((a, b) => b.monto_total - a.monto_total);

	return (
		<Stack spacing={3}>
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Top 15 Entidades por Monto</Typography>
					<ResponsiveContainer width="100%" height={Math.max(500, top15.length * 40)}>
						<BarChart data={top15} layout="vertical" margin={{ left: 30 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis type="number" tickFormatter={fCurrency} />
							<YAxis dataKey="entidad" type="category" width={260} tick={{ fontSize: 11 }} tickFormatter={(v) => truncate(v, 45)} />
							<Tooltip content={<CurrencyTooltip />} />
							<Bar dataKey="monto_total" name="Monto Total" fill={CHART_COLORS[3]} radius={[0, 4, 4, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Top 30 Entidades</Typography>
					<TableContainer sx={{ maxHeight: 600 }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontWeight: 700 }}>#</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Entidad</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Contratos</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Monto Total</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Proveedores</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{(data || []).map((row, i) => (
									<TableRow key={i} hover>
										<TableCell>{i + 1}</TableCell>
										<TableCell>{row.entidad}</TableCell>
										<TableCell align="right">{fNumber(row.total_contratos)}</TableCell>
										<TableCell align="right">{fCurrency(row.monto_total)}</TableCell>
										<TableCell align="right">{fNumber(row.total_proveedores)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</CardContent>
			</Card>
		</Stack>
	);
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: Proveedores — individual endpoint + dashboard.top_proveedores_pais
// ═══════════════════════════════════════════════════════════════════════
function TabProveedores({ dashboard, year }) {
	const proveedores = useAsyncData(() => getContratosPorProveedor(30), []);
	const concentracion = useAsyncData(() => getConcentracion(year || undefined, 20), [year]);
	const topPais = dashboard?.top_proveedores_pais || [];

	if (proveedores.loading) return <SectionLoader />;
	if (proveedores.error) return <SectionError message={proveedores.error} />;

	const top15 = (proveedores.data || []).slice(0, 15).sort((a, b) => b.monto_total - a.monto_total);

	return (
		<Stack spacing={3}>
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Top 15 Proveedores por Monto</Typography>
					<ResponsiveContainer width="100%" height={Math.max(500, top15.length * 40)}>
						<BarChart data={top15} layout="vertical" margin={{ left: 30 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis type="number" tickFormatter={fCurrency} />
							<YAxis dataKey="proveedor" type="category" width={260} tick={{ fontSize: 11 }} tickFormatter={(v) => truncate(v, 45)} />
							<Tooltip content={<CurrencyTooltip />} />
							<Bar dataKey="monto_total" name="Monto Total" fill={CHART_COLORS[5]} radius={[0, 4, 4, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{topPais.length > 0 && (
				<Card>
					<CardContent>
						<Typography variant="h6" gutterBottom>Top Proveedores a Nivel País</Typography>
						<TableContainer sx={{ maxHeight: 500 }}>
							<Table stickyHeader size="small">
								<TableHead>
									<TableRow>
										<TableCell sx={{ fontWeight: 700 }}>#</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Documento</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="right">Contratos</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="right">Monto Total</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="right">Entidades</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="right">Departamentos</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="right">Ciudades</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{topPais.map((row, i) => (
										<TableRow key={i} hover>
											<TableCell>{i + 1}</TableCell>
											<TableCell sx={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.proveedor}</TableCell>
											<TableCell>{row.documento}</TableCell>
											<TableCell align="right">{fNumber(row.total_contratos)}</TableCell>
											<TableCell align="right">{fCurrency(row.monto_total)}</TableCell>
											<TableCell align="right">{fNumber(row.total_entidades)}</TableCell>
											<TableCell align="right">{fNumber(row.total_departamentos)}</TableCell>
											<TableCell align="right">{fNumber(row.total_ciudades)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Top 30 Proveedores (global)</Typography>
					<TableContainer sx={{ maxHeight: 600 }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontWeight: 700 }}>#</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Documento</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Contratos</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Monto Total</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Entidades</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Ciudades</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="center">Período</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{(proveedores.data || []).map((row, i) => (
									<TableRow key={i} hover>
										<TableCell>{i + 1}</TableCell>
										<TableCell>{row.proveedor}</TableCell>
										<TableCell>{row.documento}</TableCell>
										<TableCell align="right">{fNumber(row.total_contratos)}</TableCell>
										<TableCell align="right">{fCurrency(row.monto_total)}</TableCell>
										<TableCell align="right">{fNumber(row.total_entidades)}</TableCell>
										<TableCell align="right">{fNumber(row.total_ciudades)}</TableCell>
										<TableCell align="center">{row.primer_anio}–{row.ultimo_anio}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Concentración de Contratación {year ? `— ${year}` : ""}
					</Typography>
					{concentracion.loading ? <SectionLoader /> : concentracion.error ? (
						<SectionError message={concentracion.error} />
					) : (
						<TableContainer sx={{ maxHeight: 500 }}>
							<Table stickyHeader size="small">
								<TableHead>
									<TableRow>
										<TableCell sx={{ fontWeight: 700 }}>#</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Proveedor</TableCell>
										<TableCell sx={{ fontWeight: 700 }}>Documento</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="right">Contratos</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="right">Monto Total</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="right">Entidades Distintas</TableCell>
										<TableCell sx={{ fontWeight: 700 }} align="right">Departamentos</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{(concentracion.data || []).map((row, i) => (
										<TableRow key={i} hover>
											<TableCell>{i + 1}</TableCell>
											<TableCell>{row.proveedor}</TableCell>
											<TableCell>{row.documento}</TableCell>
											<TableCell align="right">{fNumber(row.total_contratos)}</TableCell>
											<TableCell align="right">{fCurrency(row.monto_total)}</TableCell>
											<TableCell align="right">{fNumber(row.entidades_distintas)}</TableCell>
											<TableCell align="right">{fNumber(row.departamentos_distintos)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					)}
				</CardContent>
			</Card>
		</Stack>
	);
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: Geográfico — uses dashboard.contratos_por_departamento
// ═══════════════════════════════════════════════════════════════════════
function TabGeografico({ dashboard }) {
	const data = dashboard?.contratos_por_departamento || [];
	const sorted = [...data].sort((a, b) => b.total_contratos - a.total_contratos);
	const top20 = sorted.slice(0, 20);

	if (!sorted.length) return <Alert severity="info">Sin datos geográficos</Alert>;

	return (
		<Stack spacing={3}>
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Top 20 Departamentos por Contratos</Typography>
					<ResponsiveContainer width="100%" height={Math.max(600, top20.length * 35)}>
						<BarChart data={top20} layout="vertical" margin={{ left: 30 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis type="number" tickFormatter={fNumber} />
							<YAxis dataKey="departamento" type="category" width={200} tick={{ fontSize: 11 }} />
							<Tooltip content={<CurrencyTooltip />} />
							<Bar dataKey="total_contratos" name="Total Contratos" fill={CHART_COLORS[2]} radius={[0, 4, 4, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Monto Total por Departamento</Typography>
					<ResponsiveContainer width="100%" height={Math.max(600, top20.length * 35)}>
						<BarChart data={top20} layout="vertical" margin={{ left: 30 }}>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis type="number" tickFormatter={fCurrency} />
							<YAxis dataKey="departamento" type="category" width={200} tick={{ fontSize: 11 }} />
							<Tooltip content={<CurrencyTooltip />} />
							<Bar dataKey="monto_total" name="Monto Total" fill={CHART_COLORS[9]} radius={[0, 4, 4, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>Detalle por Departamento</Typography>
					<TableContainer sx={{ maxHeight: 600 }}>
						<Table stickyHeader size="small">
							<TableHead>
								<TableRow>
									<TableCell sx={{ fontWeight: 700 }}>#</TableCell>
									<TableCell sx={{ fontWeight: 700 }}>Departamento</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Contratos</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Monto Total</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Proveedores</TableCell>
									<TableCell sx={{ fontWeight: 700 }} align="right">Entidades</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{sorted.map((row, i) => (
									<TableRow key={i} hover>
										<TableCell>{i + 1}</TableCell>
										<TableCell>{row.departamento}</TableCell>
										<TableCell align="right">{fNumber(row.total_contratos)}</TableCell>
										<TableCell align="right">{fCurrency(row.monto_total)}</TableCell>
										<TableCell align="right">{fNumber(row.total_proveedores)}</TableCell>
										<TableCell align="right">{fNumber(row.total_entidades)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</CardContent>
			</Card>
		</Stack>
	);
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: Clasificación — uses dashboard (estado, tipo, modalidad)
// ═══════════════════════════════════════════════════════════════════════
function ClassificationPie({ title, data, nameKey }) {
	if (!data?.length) return <Alert severity="info" sx={{ my: 1 }}>Sin datos disponibles</Alert>;

	return (
		<Card sx={{ height: "100%" }}>
			<CardContent>
				<Typography variant="h6" gutterBottom>{title}</Typography>
				<ResponsiveContainer width="100%" height={420}>
					<PieChart>
						<Pie
							data={data}
							dataKey="total_contratos"
							nameKey={nameKey}
							cx="50%"
							cy="50%"
							outerRadius={150}
							label={({ name, percent }) => `${truncate(name, 20)} ${(percent * 100).toFixed(1)}%`}
						>
							{data.map((_, i) => (
								<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
							))}
						</Pie>
						<Tooltip content={<PieTooltip />} />
						<Legend wrapperStyle={{ fontSize: 12 }} />
					</PieChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

function TabClasificacion({ dashboard }) {
	const estados = dashboard?.contratos_por_estado || [];
	const tipos = dashboard?.contratos_por_tipo || [];
	const modalidades = dashboard?.contratos_por_modalidad || [];

	return (
		<Stack spacing={3}>
			<ClassificationPie title="Estado de Contratos" data={estados} nameKey="estado" />

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 6 }}>
					<ClassificationPie title="Tipo de Contrato" data={tipos} nameKey="tipo" />
				</Grid>
				<Grid size={{ xs: 12, md: 6 }}>
					<ClassificationPie title="Modalidad de Contratación" data={modalidades} nameKey="modalidad" />
				</Grid>
			</Grid>
		</Stack>
	);
}

// ═══════════════════════════════════════════════════════════════════════
// TAB: Sanciones — uses dashboard.sanciones
// ═══════════════════════════════════════════════════════════════════════
function TabSanciones({ dashboard }) {
	const sanciones = dashboard?.sanciones;
	if (!sanciones) return <Alert severity="info">Sin datos de sanciones</Alert>;

	const { disciplinarias, fiscales } = sanciones;

	return (
		<Grid container spacing={3}>
			{disciplinarias && (
				<Grid size={{ xs: 12, md: 6 }}>
					<Card sx={{ height: "100%" }}>
						<CardContent>
							<Stack direction="row" alignItems="center" spacing={1} mb={2}>
								<Iconify icon="mdi:gavel" width={28} sx={{ color: CHART_COLORS[4] }} />
								<Typography variant="h6">Sanciones Disciplinarias</Typography>
							</Stack>

							<Typography variant="h3" sx={{ color: CHART_COLORS[4], mb: 2 }}>
								{fNumber(disciplinarias.total_sanciones)}
							</Typography>

							<Typography variant="subtitle2" gutterBottom>Tipos de Sanción</Typography>
							<Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
								{(disciplinarias.tipos_sancion || []).map((t, i) => (
									<Chip key={i} label={typeof t === "string" ? t.trim() : `${t.tipo}: ${t.total}`} size="small" variant="outlined" />
								))}
							</Stack>

							{disciplinarias.tipos_inhabilidad?.length > 0 && (
								<>
									<Typography variant="subtitle2" gutterBottom>Tipos de Inhabilidad</Typography>
									<Stack direction="row" flexWrap="wrap" gap={1} mb={2}>
										{disciplinarias.tipos_inhabilidad.map((t, i) => (
											<Chip key={i} label={typeof t === "string" ? t.trim() : `${t.tipo}: ${t.total}`} size="small" color="warning" variant="outlined" />
										))}
									</Stack>
								</>
							)}

							<Typography variant="body2" color="text.secondary">
								Departamentos con sanciones: {
									Array.isArray(disciplinarias.departamentos)
										? disciplinarias.departamentos.length
										: fNumber(disciplinarias.departamentos)
								}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			)}

			{fiscales && (
				<Grid size={{ xs: 12, md: 6 }}>
					<Card sx={{ height: "100%" }}>
						<CardContent>
							<Stack direction="row" alignItems="center" spacing={1} mb={2}>
								<Iconify icon="mdi:cash-remove" width={28} sx={{ color: CHART_COLORS[7] }} />
								<Typography variant="h6">Sanciones Fiscales</Typography>
							</Stack>

							<Typography variant="h3" sx={{ color: CHART_COLORS[7], mb: 1 }}>
								{fNumber(fiscales.total_sanciones)}
							</Typography>

							<Typography variant="body1" sx={{ mb: 2 }}>
								Cuantía Total: <strong>{fCurrency(fiscales.cuantia_total)}</strong>
							</Typography>

							<Typography variant="body2" color="text.secondary">
								Departamentos: {
									Array.isArray(fiscales.departamentos)
										? fiscales.departamentos.length
										: fNumber(fiscales.departamentos)
								}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Entidades Afectadas: {
									Array.isArray(fiscales.entidades_afectadas)
										? fiscales.entidades_afectadas.length
										: fNumber(fiscales.entidades_afectadas)
								}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			)}
		</Grid>
	);
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════
const TAB_CONFIG = [
	{ label: "Temporal", icon: "mdi:chart-timeline-variant" },
	{ label: "Fuerzas", icon: "mdi:shield-star-outline" },
	{ label: "Entidades", icon: "mdi:domain" },
	{ label: "Proveedores", icon: "mdi:account-group-outline" },
	{ label: "Geográfico", icon: "mdi:map-marker-radius-outline" },
	{ label: "Clasificación", icon: "mdi:tag-multiple-outline" },
	{ label: "Sanciones", icon: "mdi:gavel" },
];

const YEAR_TABS = new Set([0, 3, 4, 5]);

export default function EstadisticasPage() {
	const [tab, setTab] = useState(0);
	const [year, setYear] = useState(2025);
	const [anios, setAnios] = useState([]);
	const [dashboard, setDashboard] = useState(null);
	const [dashLoading, setDashLoading] = useState(true);
	const [dashError, setDashError] = useState(null);

	useEffect(() => {
		getCatalogAnios()
			.then((res) => {
				const list = Array.isArray(res) ? res : res?.data || [];
				setAnios(list.sort((a, b) => b - a));
			})
			.catch(() => {});
	}, []);

	useEffect(() => {
		let cancelled = false;
		setDashLoading(true);
		setDashError(null);

		getDashboard(year || undefined)
			.then((res) => { if (!cancelled) setDashboard(res); })
			.catch((err) => { if (!cancelled) setDashError(err.message || "Error al cargar datos"); })
			.finally(() => { if (!cancelled) setDashLoading(false); });

		return () => { cancelled = true; };
	}, [year]);

	const showYearSelector = YEAR_TABS.has(tab);

	const resumen = dashboard?.resumen_general || {};

	return (
		<Stack spacing={3}>
			<Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
				<Box>
					<Typography variant="h4">Estadísticas Detalladas</Typography>
					{dashboard?.anio_consultado && (
						<Typography variant="body2" color="text.secondary">
							Datos filtrados: {dashboard.anio_consultado}
						</Typography>
					)}
				</Box>

				<Stack direction="row" spacing={2} alignItems="center">
					{!dashLoading && resumen.total_contratos && (
						<Chip
							label={`${fNumber(resumen.total_contratos)} contratos — ${fCurrency(resumen.monto_total)}`}
							color="primary"
							variant="outlined"
						/>
					)}

					{showYearSelector && (
						<FormControl size="small" sx={{ minWidth: 140 }}>
							<InputLabel>Año</InputLabel>
							<Select value={year} label="Año" onChange={(e) => setYear(e.target.value)}>
								<MenuItem value="">Todos</MenuItem>
								{anios.map((a) => (
									<MenuItem key={a} value={a}>{a}</MenuItem>
								))}
							</Select>
						</FormControl>
					)}
				</Stack>
			</Stack>

			<Tabs
				value={tab}
				onChange={(_, v) => setTab(v)}
				variant="scrollable"
				scrollButtons="auto"
				sx={{ borderBottom: 1, borderColor: "divider" }}
			>
				{TAB_CONFIG.map((t, i) => (
					<Tab
						key={i}
						label={t.label}
						icon={<Iconify icon={t.icon} width={20} />}
						iconPosition="start"
						sx={{ minHeight: 48, textTransform: "none" }}
					/>
				))}
			</Tabs>

			{dashLoading ? (
				<SectionLoader />
			) : dashError ? (
				<SectionError message={dashError} />
			) : (
				<>
					{tab === 0 && <TabTemporal dashboard={dashboard} year={year} />}
					{tab === 1 && <TabFuerzas dashboard={dashboard} />}
					{tab === 2 && <TabEntidades />}
					{tab === 3 && <TabProveedores dashboard={dashboard} year={year} />}
					{tab === 4 && <TabGeografico dashboard={dashboard} />}
					{tab === 5 && <TabClasificacion dashboard={dashboard} />}
					{tab === 6 && <TabSanciones dashboard={dashboard} />}
				</>
			)}
		</Stack>
	);
}
