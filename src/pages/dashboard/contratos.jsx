import { useState, useEffect, useCallback } from "react";

import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { Iconify } from "@/components/core";
import { GraphViewer } from "@/components/core/graph-viewer";
import {
	graphSearch,
	getCatalogFuerzas,
	getCatalogAnios,
	getCatalogEntidades,
	getCatalogCiudades,
	getCatalogProveedores,
} from "@/services/helios-api";
import { fCurrency, fNumber } from "@/utils/format";

const PRIMARY = "#2E3B4E";
const SECONDARY = "#F2A900";

function neo4jInt(v) {
	if (v == null) return null;
	if (typeof v === "number") return v;
	if (typeof v === "object" && "low" in v) return v.high * 2147483648 + (v.low >>> 0);
	return Number(v) || null;
}

function neo4jDate(v) {
	if (v == null) return null;
	if (typeof v === "string") return v;
	if (typeof v === "object" && v.year) {
		const y = neo4jInt(v.year);
		const m = String(neo4jInt(v.month) || 1).padStart(2, "0");
		const d = String(neo4jInt(v.day) || 1).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}
	return null;
}

function resolveNeo4jValue(value) {
	if (value == null) return null;
	if (typeof value !== "object") return value;
	if ("year" in value && "month" in value) return neo4jDate(value);
	if ("low" in value && "high" in value) return neo4jInt(value);
	return value;
}

const SUMMARY_CARDS = [
	{ key: "total_contratos", label: "Total Contratos", icon: "solar:document-bold-duotone", color: PRIMARY, format: fNumber },
	{ key: "total_proveedores", label: "Total Proveedores", icon: "solar:users-group-rounded-bold-duotone", color: "#5C6BC0", format: fNumber },
	{ key: "total_entidades", label: "Total Entidades", icon: "solar:buildings-bold-duotone", color: "#4A6741", format: fNumber },
	{ key: "total_departamentos", label: "Total Departamentos", icon: "solar:map-bold-duotone", color: "#29B6F6", format: fNumber },
	{ key: "valor_total", label: "Valor Total", icon: "solar:wallet-money-bold-duotone", color: SECONDARY, format: fCurrency },
];

const CONTRACT_COLUMNS = [
	{ key: "Objeto", label: "Descripción", maxWidth: 300 },
	{ key: "Entidad", label: "Entidad" },
	{ key: "Proveedor", label: "Proveedor" },
	{ key: "Estado_Contrato", label: "Estado" },
	{ key: "Tipo_Contrato", label: "Tipo" },
	{ key: "Fecha_Firma", label: "Fecha Firma", isDate: true },
	{ key: "Valor_Contrato", label: "Valor", align: "right", isCurrency: true },
];

function useDebouncedCatalog(fetchFn, delay = 300) {
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);

	const search = useCallback(
		(() => {
			let timer;
			return (term) => {
				clearTimeout(timer);
				if (!term || term.length < 2) {
					setOptions([]);
					return;
				}
				setLoading(true);
				timer = setTimeout(async () => {
					try {
						const data = await fetchFn(term);
						setOptions(Array.isArray(data) ? data : []);
					} catch {
						setOptions([]);
					} finally {
						setLoading(false);
					}
				}, delay);
			};
		})(),
		[fetchFn, delay],
	);

	return { options, loading, search };
}

const NODE_TYPE_LABELS = {
	CONTRATOS: { label: "Contrato", icon: "solar:document-bold-duotone", color: "#F2A900" },
	NITS: { label: "Entidad / NIT", icon: "solar:buildings-bold-duotone", color: "#5C6BC0" },
	DEPARTAMENTO: { label: "Departamento", icon: "solar:map-bold-duotone", color: "#66BB6A" },
	CIUDAD: { label: "Ciudad", icon: "solar:map-point-bold-duotone", color: "#29B6F6" },
	PROVEEDOR: { label: "Proveedor", icon: "solar:user-bold-duotone", color: "#EF5350" },
	ADJUDICADOR: { label: "Adjudicador", icon: "solar:user-check-bold-duotone", color: "#AB47BC" },
	FUERZA: { label: "Fuerza", icon: "solar:shield-bold-duotone", color: "#4A6741" },
};

const PROPERTY_LABELS = {
	Objeto: "Descripción / Objeto",
	Entidad: "Entidad",
	Proveedor: "Proveedor",
	Estado_Contrato: "Estado",
	Tipo_Contrato: "Tipo de contrato",
	Justificacion_Modalidad: "Modalidad",
	Valor_Contrato: "Valor contrato",
	Valor_Pago_Adelantado: "Valor pago adelantado",
	Documento_Proveedor: "Doc. Proveedor",
	Nit_Entidad: "NIT Entidad",
	Ciudad: "Ciudad",
	Departamento: "Departamento",
	Fecha_Firma: "Fecha de firma",
	Ano_Firma: "Año de firma",
	Mes_Firma: "Mes de firma",
	Ref_Contrato: "Ref. Contrato",
	id_contrato: "ID Contrato",
	Proceso_Compra: "Proceso de compra",
	Nombre_Representante_Legal: "Representante legal",
	Identificacion_Representante_Legal: "ID Rep. Legal",
	Ordenador_Gasto: "Ordenador del gasto",
	Documento_Ordenador_Gasto: "Doc. Ordenador Gasto",
	Tipo_Doc_Proveedor: "Tipo doc. proveedor",
	Cod_Categoria_Principal: "Categoría principal",
	Hab_Pago_Adelantado: "Pago adelantado",
	Dias_Adicionados: "Días adicionados",
	Url_Proceso: "URL Proceso",
	nombre: "Nombre",
	Nombre: "Nombre",
	Nombre_Entidad: "Nombre Entidad",
	nit_entidad: "NIT Entidad",
	Fuerza: "Fuerza",
	razon_social: "Razón social",
	codigo: "Código",
	Codigo_Proveedor: "Código proveedor",
};

const HIDDEN_PROPS = new Set(["Id_Url", "Codigo_Proveedor"]);

function formatPropertyValue(key, rawValue) {
	const value = resolveNeo4jValue(rawValue);
	if (value == null || value === "") return "—";
	if (typeof value === "object") return JSON.stringify(value);
	if (key.toLowerCase().includes("valor") && typeof value === "number") return fCurrency(value);
	if (key.toLowerCase().includes("url") && typeof value === "string" && value.startsWith("HTTP"))
		return value;
	return String(value);
}

function NodeDetailCard({ node, onClose }) {
	const group = node.group || (node.labels && node.labels[0]) || "OTRO";
	const meta = NODE_TYPE_LABELS[group] || { label: group, icon: "solar:info-circle-bold-duotone", color: "#919EAB" };
	const props = node.properties || {};
	const entries = Object.entries(props).filter(
		([k, v]) => v != null && v !== "" && !HIDDEN_PROPS.has(k),
	);

	return (
		<Card
			sx={{
				height: "100%",
				maxHeight: 580,
				display: "flex",
				flexDirection: "column",
				borderTop: 3,
				borderColor: meta.color,
			}}
		>
			<CardContent sx={{ pb: 1 }}>
				<Stack direction="row" alignItems="center" justifyContent="space-between">
					<Stack direction="row" alignItems="center" spacing={1}>
						<Iconify icon={meta.icon} width={24} sx={{ color: meta.color }} />
						<Typography variant="subtitle1" fontWeight={700}>
							{meta.label}
						</Typography>
					</Stack>
					<IconButton size="small" onClick={onClose}>
						<Iconify icon="solar:close-circle-bold-duotone" width={20} />
					</IconButton>
				</Stack>

				{node.labels && node.labels.length > 0 && (
					<Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
						{node.labels.map((lbl) => (
							<Chip key={lbl} label={lbl} size="small" variant="outlined" sx={{ fontSize: 11 }} />
						))}
					</Stack>
				)}
			</CardContent>

			<Divider />

			<Box sx={{ flex: 1, overflow: "auto", px: 2, py: 1.5 }}>
				{entries.length === 0 ? (
					<Typography variant="body2" color="text.disabled" sx={{ py: 2, textAlign: "center" }}>
						Sin propiedades disponibles
					</Typography>
				) : (
					<Stack spacing={1.5}>
						{entries.map(([key, value]) => (
							<Box key={key}>
								<Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
									{PROPERTY_LABELS[key] || key.replace(/_/g, " ")}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										wordBreak: "break-word",
										fontWeight: key.toLowerCase().includes("valor") ? 600 : 400,
									}}
								>
									{formatPropertyValue(key, value)}
								</Typography>
							</Box>
						))}
					</Stack>
				)}
			</Box>

			<Divider />

			<Box sx={{ px: 2, py: 1 }}>
				<Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontFamily: "monospace" }}>
					ID: {node.id}
				</Typography>
			</Box>
		</Card>
	);
}

export default function ContratosPage() {
	const [fuerzas, setFuerzas] = useState([]);
	const [anios, setAnios] = useState([]);

	const [filters, setFilters] = useState({
		fuerza: "",
		ano: 2025,
		entidad: "",
		ciudad: "",
		proveedor: "",
		documento: "",
		limit: 30,
	});

	const [searching, setSearching] = useState(false);
	const [error, setError] = useState(null);
	const [result, setResult] = useState(null);
	const [selectedNode, setSelectedNode] = useState(null);

	const entidadCatalog = useDebouncedCatalog(getCatalogEntidades);
	const ciudadCatalog = useDebouncedCatalog(getCatalogCiudades);
	const proveedorCatalog = useDebouncedCatalog(getCatalogProveedores);

	useEffect(() => {
		Promise.allSettled([getCatalogFuerzas(), getCatalogAnios()]).then(([f, a]) => {
			if (f.status === "fulfilled") setFuerzas(Array.isArray(f.value) ? f.value : []);
			if (a.status === "fulfilled") setAnios(Array.isArray(a.value) ? a.value : []);
		});
	}, []);

	const updateFilter = (key) => (e, newValue) => {
		const val = newValue !== undefined ? newValue : e?.target?.value ?? "";
		setFilters((prev) => ({ ...prev, [key]: val }));
	};

	const handleSearch = async () => {
		setSearching(true);
		setError(null);
		setSelectedNode(null);
		try {
			const payload = {};
			if (filters.fuerza) payload.fuerza = filters.fuerza;
			if (filters.ano) payload.ano = filters.ano;
			if (filters.entidad) payload.entidad = filters.entidad;
			if (filters.ciudad) payload.ciudad = filters.ciudad;
			if (filters.proveedor) payload.proveedor = filters.proveedor;
			if (filters.documento) payload.documento = filters.documento;
			if (filters.limit) payload.limit = filters.limit;

			const data = await graphSearch(payload);
			setResult(data);
		} catch (err) {
			setError(err?.message || "Error al realizar la búsqueda");
		} finally {
			setSearching(false);
		}
	};

	const rawSummary = result?.summary?.resultSet?.[0] || null;
	const summary = rawSummary
		? Object.fromEntries(Object.entries(rawSummary).map(([k, v]) => [k, resolveNeo4jValue(v)]))
		: null;
	const graphData = result?.graph || { nodes: [], links: [] };
	const contractNodes = (graphData.nodes || []).filter(
		(n) => n.group === "CONTRATOS" || (n.labels && n.labels.includes("CONTRATOS")),
	);

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Búsqueda de Contratos</Typography>
				<Typography variant="body2" color="text.secondary">
					Consulta contratos por filtros y visualiza relaciones en grafo &mdash; Portal Helios
				</Typography>
			</Stack>

			{/* ─── Filtros ─────────────────────────────────────────── */}
			<Card>
				<CardContent>
					<Typography variant="h6" sx={{ mb: 2 }}>
						Filtros de búsqueda
					</Typography>

					<Grid container spacing={2}>
						<Grid size={{ xs: 12, sm: 6, md: 4 }}>
							<FormControl fullWidth size="small">
								<InputLabel>Fuerza</InputLabel>
								<Select
									value={filters.fuerza}
									label="Fuerza"
									onChange={(e) => setFilters((prev) => ({ ...prev, fuerza: e.target.value }))}
								>
									<MenuItem value="">
										<em>Todas</em>
									</MenuItem>
									{fuerzas.map((f) =>
										typeof f === "object" ? (
											<MenuItem key={f.codigo} value={f.codigo}>
												{f.nombre}
											</MenuItem>
										) : (
											<MenuItem key={f} value={f}>
												{f}
											</MenuItem>
										),
									)}
								</Select>
							</FormControl>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 4 }}>
							<FormControl fullWidth size="small">
								<InputLabel>Año</InputLabel>
								<Select
									value={filters.ano}
									label="Año"
									onChange={(e) => setFilters((prev) => ({ ...prev, ano: e.target.value }))}
								>
									{(anios.length ? anios : [2025]).map((a) => (
										<MenuItem key={a} value={a}>
											{a}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 4 }}>
							<Autocomplete
								freeSolo
								size="small"
								options={entidadCatalog.options}
								loading={entidadCatalog.loading}
								onInputChange={(_, value) => entidadCatalog.search(value)}
								onChange={updateFilter("entidad")}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Entidad"
										InputProps={{
											...params.InputProps,
											endAdornment: (
												<>
													{entidadCatalog.loading && <CircularProgress size={18} />}
													{params.InputProps.endAdornment}
												</>
											),
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 4 }}>
							<Autocomplete
								freeSolo
								size="small"
								options={ciudadCatalog.options}
								loading={ciudadCatalog.loading}
								onInputChange={(_, value) => ciudadCatalog.search(value)}
								onChange={updateFilter("ciudad")}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Ciudad"
										InputProps={{
											...params.InputProps,
											endAdornment: (
												<>
													{ciudadCatalog.loading && <CircularProgress size={18} />}
													{params.InputProps.endAdornment}
												</>
											),
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 4 }}>
							<Autocomplete
								freeSolo
								size="small"
								options={proveedorCatalog.options}
								loading={proveedorCatalog.loading}
								onInputChange={(_, value) => proveedorCatalog.search(value)}
								onChange={updateFilter("proveedor")}
								renderInput={(params) => (
									<TextField
										{...params}
										label="Proveedor"
										InputProps={{
											...params.InputProps,
											endAdornment: (
												<>
													{proveedorCatalog.loading && <CircularProgress size={18} />}
													{params.InputProps.endAdornment}
												</>
											),
										}}
									/>
								)}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 4 }}>
							<TextField
								fullWidth
								size="small"
								label="Documento CC / NIT"
								value={filters.documento}
								onChange={(e) => setFilters((prev) => ({ ...prev, documento: e.target.value }))}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 4 }}>
							<Typography variant="caption" color="text.secondary" gutterBottom>
								Límite de resultados: {filters.limit}
							</Typography>
							<Slider
								value={filters.limit}
								onChange={(_, val) => setFilters((prev) => ({ ...prev, limit: val }))}
								min={1}
								max={100}
								valueLabelDisplay="auto"
								sx={{ color: PRIMARY }}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 4 }} sx={{ display: "flex", alignItems: "center" }}>
							<LoadingButton
								variant="contained"
								loading={searching}
								onClick={handleSearch}
								startIcon={<Iconify icon="solar:magnifer-bold-duotone" />}
								sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#1e2b3e" } }}
							>
								Buscar
							</LoadingButton>
						</Grid>
					</Grid>
				</CardContent>
			</Card>

			{error && <Alert severity="error">{error}</Alert>}

			{/* ─── Resumen ────────────────────────────────────────── */}
			{summary && (
				<Grid container spacing={2}>
					{SUMMARY_CARDS.map(({ key, label, icon, color, format }) => (
						<Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={key}>
							<Card sx={{ height: "100%" }}>
								<CardContent sx={{ textAlign: "center", py: 2 }}>
									<Iconify icon={icon} width={32} sx={{ color, mb: 1 }} />
									<Typography variant="h5">{format(summary[key])}</Typography>
									<Typography variant="caption" color="text.secondary">
										{label}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{/* ─── Grafo + Detalle ───────────────────────────────── */}
			{result && (
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, md: selectedNode ? 8 : 12 }}>
						<Card sx={{ height: "100%" }}>
							<CardContent>
								<Typography variant="h6" sx={{ mb: 2 }}>
									Grafo de relaciones
								</Typography>
								<GraphViewer
									data={graphData}
									height={500}
									onNodeClick={(node) =>
										setSelectedNode((prev) => (prev?.id === node.id ? null : node))
									}
									selectedNodeId={selectedNode?.id}
								/>
							</CardContent>
						</Card>
					</Grid>

					{selectedNode && (
						<Grid size={{ xs: 12, md: 4 }}>
							<NodeDetailCard node={selectedNode} onClose={() => setSelectedNode(null)} />
						</Grid>
					)}
				</Grid>
			)}

			{/* ─── Tabla de contratos ─────────────────────────────── */}
			{contractNodes.length > 0 && (
				<Card>
					<CardContent sx={{ p: 0 }}>
						<Box sx={{ px: 3, pt: 3, pb: 1 }}>
							<Typography variant="h6">
								Contratos encontrados ({fNumber(contractNodes.length)})
							</Typography>
						</Box>
						<TableContainer>
							<Table size="small">
								<TableHead>
									<TableRow>
										{CONTRACT_COLUMNS.map((col) => (
											<TableCell key={col.key} align={col.align || "left"}>
												{col.label}
											</TableCell>
										))}
									</TableRow>
								</TableHead>
							<TableBody>
								{contractNodes.map((node, idx) => {
									const props = node.properties || {};
									return (
										<TableRow key={node.id ?? idx} hover>
											{CONTRACT_COLUMNS.map((col) => {
												const raw = props[col.key];
												let display;
												if (col.isDate) {
													display = neo4jDate(raw) || "—";
												} else if (col.isCurrency) {
													display = fCurrency(neo4jInt(raw));
												} else {
													const resolved = resolveNeo4jValue(raw);
													display = resolved != null ? String(resolved) : "—";
												}
												if (col.maxWidth && display.length > 80) {
													display = display.slice(0, 77) + "...";
												}
												return (
													<TableCell
														key={col.key}
														align={col.align || "left"}
														sx={col.maxWidth ? { maxWidth: col.maxWidth, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } : undefined}
													>
														{display}
													</TableCell>
												);
											})}
										</TableRow>
									);
								})}
							</TableBody>
							</Table>
						</TableContainer>
					</CardContent>
				</Card>
			)}

			{searching && (
				<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
					<CircularProgress sx={{ color: PRIMARY }} />
				</Box>
			)}
		</Stack>
	);
}
