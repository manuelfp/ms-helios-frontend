import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
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
import TableSortLabel from "@mui/material/TableSortLabel";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { Iconify, DataSourceBadge } from "@/components/core";
import { GraphViewer } from "@/components/core/graph-viewer";
import { useExpertMode } from "@/contexts/expert-mode-context";
import { CONTRATOS_URL_DEFAULTS, useUrlFilters } from "@/hooks/use-url-filters";
import { usePrivacy } from "@/hooks/use-privacy";
import {
	contractSearch,
	neo4jGraphSearch,
	getCatalogFuerzas,
	getCatalogAnios,
	getCatalogEntidades,
	getCatalogCiudades,
	getCatalogProveedores,
} from "@/services/helios-api";
import { fCurrency, fNumber, maskDoc, maskName } from "@/utils/format";

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

const BQ_TABLE_COLUMNS = [
	{ key: "id_contrato", label: "ID Contrato", maxWidth: 180, sortable: true },
	{ key: "nombre_entidad", label: "Entidad", maxWidth: 260, sortable: true, filterable: true },
	{ key: "proveedor_adjudicado", label: "Proveedor", maxWidth: 260, sortable: true, filterable: true },
	{ key: "estado_contrato", label: "Estado", sortable: true, filterable: true },
	{ key: "tipo_de_contrato", label: "Tipo", sortable: true, filterable: true },
	{ key: "departamento", label: "Departamento", sortable: true, filterable: true },
	{ key: "anio", label: "Año", sortable: true },
	{ key: "valor_del_contrato", label: "Valor", align: "right", isCurrency: true, sortable: true },
];

const DETAIL_LABELS = {
	id_contrato: "ID Contrato",
	nombre_entidad: "Entidad",
	nit_entidad: "NIT Entidad",
	departamento: "Departamento",
	ciudad: "Ciudad",
	proveedor_adjudicado: "Proveedor Adjudicado",
	documento_proveedor: "Doc. Proveedor",
	valor_del_contrato: "Valor del Contrato",
	anio: "Año",
	tipo_de_contrato: "Tipo de Contrato",
	estado_contrato: "Estado",
	justificacion_modalidad_de: "Modalidad de Contratación",
	fuerza: "Fuerza",
};

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

const SENSITIVE_NAME_KEYS = new Set([
	"Proveedor", "Entidad", "Nombre_Entidad", "Nombre_Representante_Legal",
	"Ordenador_Gasto", "razon_social", "nombre", "Nombre",
]);
const SENSITIVE_DOC_KEYS = new Set([
	"Documento_Proveedor", "Nit_Entidad", "Documento_Ordenador_Gasto",
	"Identificacion_Representante_Legal", "nit_entidad",
]);

function formatPropertyValue(key, rawValue, obfuscate = false, visibleChars = 1, visibleLastChars = 3, maskChar = "▮") {
	const value = resolveNeo4jValue(rawValue);
	if (value == null || value === "") return "—";
	if (typeof value === "object") return JSON.stringify(value);
	if (key.toLowerCase().includes("valor") && typeof value === "number") return fCurrency(value);
	if (key.toLowerCase().includes("url") && typeof value === "string" && value.startsWith("HTTP"))
		return value;
	const str = String(value);
	if (obfuscate) {
		if (SENSITIVE_NAME_KEYS.has(key)) return maskName(str, visibleChars, maskChar);
		if (SENSITIVE_DOC_KEYS.has(key)) return maskDoc(str, visibleLastChars, maskChar);
	}
	return str;
}

function NodeDetailCard({ node, onClose }) {
	const { obfuscate, visibleChars, visibleLastChars, maskChar } = usePrivacy();
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
									{formatPropertyValue(key, value, obfuscate, visibleChars, visibleLastChars, maskChar)}
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
	const { obfuscate, visibleChars, visibleLastChars, maskChar } = usePrivacy();
	const { expertMode } = useExpertMode();
	const [fuerzas, setFuerzas] = useState([]);
	const [anios, setAnios] = useState([]);

	const [filters, setFilters] = useUrlFilters(CONTRATOS_URL_DEFAULTS);

	const [searching, setSearching] = useState(false);
	const [graphLoading, setGraphLoading] = useState(false);
	const [error, setError] = useState(null);
	const [tableResult, setTableResult] = useState(null);
	const [searchMeta, setSearchMeta] = useState(null);
	const [graphData, setGraphData] = useState({ nodes: [], links: [] });
	const [selectedNode, setSelectedNode] = useState(null);
	const autoSearchDone = useRef(false);

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
		let val = newValue !== undefined ? newValue : e?.target?.value ?? "";
		if (key === "ano" || key === "limit") {
			const n = parseInt(String(val), 10);
			val = Number.isFinite(n) ? n : CONTRATOS_URL_DEFAULTS[key];
		}
		setFilters({ [key]: val });
	};

	const buildPayload = () => {
		const payload = {};
		if (filters.fuerza) payload.fuerza = filters.fuerza;
		if (filters.ano) payload.ano = filters.ano;
		if (filters.entidad) payload.entidad = filters.entidad;
		if (filters.ciudad) payload.ciudad = filters.ciudad;
		if (filters.proveedor) payload.proveedor = filters.proveedor;
		if (filters.documento) payload.documento = filters.documento;
		if (filters.limit) payload.limit = filters.limit;
		return payload;
	};

	const handleSearch = useCallback(async () => {
		setSearching(true);
		setError(null);
		setSelectedNode(null);
		setGraphData({ nodes: [], links: [] });

		const payload = buildPayload();

		try {
			const data = await contractSearch(payload);
			setTableResult(data);
			setSearchMeta(data?._meta || null);
		} catch (err) {
			setError(err?.message || "Error al realizar la búsqueda");
		} finally {
			setSearching(false);
		}

		setGraphLoading(true);
		neo4jGraphSearch(payload)
			.then((gData) => setGraphData(gData?.graph || { nodes: [], links: [] }))
			.catch(() => {})
			.finally(() => setGraphLoading(false));
	}, [filters]);

	useEffect(() => {
		if (autoSearchDone.current) return;
		const has = Boolean(filters.documento?.trim() || filters.fuerza || filters.entidad?.trim());
		if (!has) return;
		autoSearchDone.current = true;
		handleSearch();
	}, [filters.documento, filters.fuerza, filters.entidad, handleSearch]);

	const rawSummary = tableResult?.summary?.resultSet?.[0] || null;
	const summary = rawSummary || null;
	const contractRows = tableResult?.data?.resultSet || [];

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Búsqueda de Contratos</Typography>
				<Typography variant="body2" color="text.secondary">
					Consulta contratos por filtros y visualiza relaciones en grafo &mdash; Portal Helios
				</Typography>
			</Stack>

			{searchMeta && (
				<Box>
					<DataSourceBadge meta={searchMeta} compact={!expertMode} />
				</Box>
			)}

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
									onChange={updateFilter("fuerza")}
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
									onChange={updateFilter("ano")}
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
								onChange={updateFilter("documento")}
							/>
						</Grid>

						<Grid size={{ xs: 12, sm: 6, md: 4 }}>
							<Typography variant="caption" color="text.secondary" gutterBottom>
								Límite de resultados: {filters.limit}
							</Typography>
							<Slider
								value={filters.limit}
								onChange={(_, val) => updateFilter("limit")(null, val)}
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

			{/* ─── Tabla de contratos (BigQuery) ──────────────────── */}
			{contractRows.length > 0 && (
				<ContractsTable
					rows={contractRows}
					obfuscate={obfuscate}
					visibleChars={visibleChars}
					visibleLastChars={visibleLastChars}
					maskChar={maskChar}
				/>
			)}

			{/* ─── Grafo de relaciones (Neo4j) ───────────────────── */}
			{(graphData.nodes?.length > 0 || graphLoading) && (
				<Grid container spacing={2}>
					<Grid size={{ xs: 12, md: selectedNode ? 8 : 12 }}>
						<Card sx={{ height: "100%" }}>
							<CardContent>
								<Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
									<Typography variant="h6">Grafo de relaciones</Typography>
									{graphLoading && <CircularProgress size={20} />}
									{graphLoading && (
										<Typography variant="caption" color="text.secondary">
											Generando grafo...
										</Typography>
									)}
								</Stack>
								{graphData.nodes?.length > 0 ? (
									<GraphViewer
										data={graphData}
										height={500}
										onNodeClick={(node) =>
											setSelectedNode((prev) => (prev?.id === node.id ? null : node))
										}
										selectedNodeId={selectedNode?.id}
									/>
								) : (
									<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
										<CircularProgress sx={{ color: PRIMARY }} />
									</Box>
								)}
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

			{searching && (
				<Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
					<CircularProgress sx={{ color: PRIMARY }} />
				</Box>
			)}
		</Stack>
	);
}

// ─── Interactive contracts table ────────────────────────────────────

function ContractsTable({ rows, obfuscate, visibleChars, visibleLastChars, maskChar }) {
	const [searchText, setSearchText] = useState("");
	const [columnFilters, setColumnFilters] = useState({});
	const [orderBy, setOrderBy] = useState("");
	const [orderDir, setOrderDir] = useState("asc");
	const [detailRow, setDetailRow] = useState(null);

	const filterableColumns = BQ_TABLE_COLUMNS.filter((c) => c.filterable);

	const uniqueValues = useMemo(() => {
		const map = {};
		for (const col of filterableColumns) {
			const vals = new Set();
			rows.forEach((r) => { if (r[col.key] != null && r[col.key] !== "") vals.add(String(r[col.key])); });
			map[col.key] = [...vals].sort();
		}
		return map;
	}, [rows]);

	const filteredRows = useMemo(() => {
		let data = rows;

		if (searchText.trim()) {
			const q = searchText.toLowerCase();
			data = data.filter((r) =>
				Object.values(r).some((v) => v != null && String(v).toLowerCase().includes(q)),
			);
		}

		for (const [key, value] of Object.entries(columnFilters)) {
			if (value) data = data.filter((r) => String(r[key]) === value);
		}

		if (orderBy) {
			data = [...data].sort((a, b) => {
				const va = a[orderBy];
				const vb = b[orderBy];
				if (va == null && vb == null) return 0;
				if (va == null) return 1;
				if (vb == null) return -1;
				if (typeof va === "number" && typeof vb === "number") return orderDir === "asc" ? va - vb : vb - va;
				const sa = String(va).toLowerCase();
				const sb = String(vb).toLowerCase();
				return orderDir === "asc" ? sa.localeCompare(sb) : sb.localeCompare(sa);
			});
		}

		return data;
	}, [rows, searchText, columnFilters, orderBy, orderDir]);

	const handleSort = (key) => {
		if (orderBy === key) {
			setOrderDir((prev) => (prev === "asc" ? "desc" : "asc"));
		} else {
			setOrderBy(key);
			setOrderDir("asc");
		}
	};

	const handleColumnFilter = (key) => (e) => {
		setColumnFilters((prev) => ({ ...prev, [key]: e.target.value }));
	};

	const activeFilterCount = Object.values(columnFilters).filter(Boolean).length + (searchText.trim() ? 1 : 0);

	const clearFilters = () => {
		setSearchText("");
		setColumnFilters({});
	};

	function formatCell(col, raw) {
		if (col.isCurrency) return fCurrency(raw);
		if (raw == null) return "—";
		const str = String(raw);
		if (obfuscate && SENSITIVE_NAME_KEYS.has(col.key)) return maskName(str, visibleChars, maskChar);
		if (obfuscate && SENSITIVE_DOC_KEYS.has(col.key)) return maskDoc(str, visibleLastChars, maskChar);
		return str;
	}

	return (
		<>
			<Card>
				<CardContent sx={{ pb: 0 }}>
					<Stack spacing={2}>
						{/* Header + search */}
						<Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }} justifyContent="space-between">
							<Stack direction="row" spacing={1} alignItems="center">
								<Typography variant="h6">
									Contratos encontrados
								</Typography>
								<Chip label={`${fNumber(filteredRows.length)} de ${fNumber(rows.length)}`} size="small" color="primary" variant="outlined" />
							</Stack>

							<Stack direction="row" spacing={1} alignItems="center">
								<TextField
									size="small"
									placeholder="Buscar en resultados..."
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
									slotProps={{
										input: {
											startAdornment: (
												<InputAdornment position="start">
													<Iconify icon="solar:magnifer-bold" width={18} sx={{ color: "text.disabled" }} />
												</InputAdornment>
											),
											endAdornment: searchText ? (
												<InputAdornment position="end">
													<IconButton size="small" onClick={() => setSearchText("")}>
														<Iconify icon="solar:close-circle-bold" width={16} />
													</IconButton>
												</InputAdornment>
											) : null,
										},
									}}
									sx={{ minWidth: 240 }}
								/>
								{activeFilterCount > 0 && (
									<Chip
										label={`${activeFilterCount} filtro${activeFilterCount > 1 ? "s" : ""}`}
										size="small"
										color="warning"
										onDelete={clearFilters}
									/>
								)}
							</Stack>
						</Stack>

						{/* Column filters */}
						<Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
							{filterableColumns.map((col) => (
								<FormControl key={col.key} size="small" sx={{ minWidth: 150 }}>
									<InputLabel>{col.label}</InputLabel>
									<Select
										value={columnFilters[col.key] || ""}
										label={col.label}
										onChange={handleColumnFilter(col.key)}
									>
										<MenuItem value=""><em>Todos</em></MenuItem>
										{(uniqueValues[col.key] || []).slice(0, 50).map((v) => (
											<MenuItem key={v} value={v}>
												{v.length > 40 ? v.slice(0, 37) + "…" : v}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							))}
						</Stack>
					</Stack>
				</CardContent>

				{/* Table */}
				<TableContainer sx={{ maxHeight: 600 }}>
					<Table size="small" stickyHeader>
						<TableHead>
							<TableRow>
								<TableCell sx={{ fontWeight: 600, width: 48 }} />
								{BQ_TABLE_COLUMNS.map((col) => (
									<TableCell
										key={col.key}
										align={col.align || "left"}
										sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
										sortDirection={orderBy === col.key ? orderDir : false}
									>
										{col.sortable ? (
											<TableSortLabel
												active={orderBy === col.key}
												direction={orderBy === col.key ? orderDir : "asc"}
												onClick={() => handleSort(col.key)}
											>
												{col.label}
											</TableSortLabel>
										) : (
											col.label
										)}
									</TableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{filteredRows.map((row, idx) => (
								<TableRow
									key={row.id_contrato || idx}
									hover
									sx={{ cursor: "pointer" }}
									onClick={() => setDetailRow(row)}
								>
									<TableCell sx={{ px: 0.5 }}>
										<Tooltip title="Ver detalle" arrow>
											<IconButton size="small" sx={{ color: "primary.main" }}>
												<Iconify icon="solar:eye-bold-duotone" width={20} />
											</IconButton>
										</Tooltip>
									</TableCell>
									{BQ_TABLE_COLUMNS.map((col) => {
										const display = formatCell(col, row[col.key]);
										const truncated = col.maxWidth && display.length > 80 ? display.slice(0, 77) + "..." : display;
										return (
											<TableCell
												key={col.key}
												align={col.align || "left"}
												sx={col.maxWidth ? { maxWidth: col.maxWidth, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } : { whiteSpace: "nowrap" }}
											>
												{truncated}
											</TableCell>
										);
									})}
								</TableRow>
							))}

							{filteredRows.length === 0 && (
								<TableRow>
									<TableCell colSpan={BQ_TABLE_COLUMNS.length + 1} align="center" sx={{ py: 4 }}>
										<Typography variant="body2" color="text.disabled">
											No se encontraron contratos con los filtros aplicados.
										</Typography>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</TableContainer>
			</Card>

			<ContractDetailDialog
				contract={detailRow}
				open={!!detailRow}
				onClose={() => setDetailRow(null)}
				obfuscate={obfuscate}
				visibleChars={visibleChars}
				visibleLastChars={visibleLastChars}
				maskChar={maskChar}
			/>
		</>
	);
}

// ─── Contract detail modal ──────────────────────────────────────────

function ContractDetailDialog({ contract, open, onClose, obfuscate, visibleChars, visibleLastChars, maskChar }) {
	if (!contract) return null;

	const entries = Object.entries(contract).filter(([, v]) => v != null && v !== "");

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
				<Stack direction="row" alignItems="center" spacing={1}>
					<Iconify icon="solar:document-bold-duotone" width={24} sx={{ color: SECONDARY }} />
					<Typography variant="h6">Detalle del Contrato</Typography>
				</Stack>
				<IconButton size="small" onClick={onClose}>
					<Iconify icon="solar:close-circle-bold-duotone" width={22} />
				</IconButton>
			</DialogTitle>

			<Divider />

			<DialogContent sx={{ pt: 2 }}>
				<Stack spacing={2.5}>
					{entries.map(([key, value]) => {
						const label = DETAIL_LABELS[key] || PROPERTY_LABELS[key] || key.replace(/_/g, " ");
						const isMonetary = key.toLowerCase().includes("valor") || key.toLowerCase().includes("monto");
						let display;

						if (value == null) display = "—";
						else if (isMonetary && typeof value === "number") display = fCurrency(value);
						else if (typeof value === "number") display = fNumber(value);
						else display = String(value);

						if (obfuscate) {
							if (SENSITIVE_NAME_KEYS.has(key)) display = maskName(display, visibleChars, maskChar);
							else if (SENSITIVE_DOC_KEYS.has(key)) display = maskDoc(display, visibleLastChars, maskChar);
						}

						return (
							<Box key={key}>
								<Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
									{label}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										wordBreak: "break-word",
										fontWeight: isMonetary ? 700 : 400,
										fontSize: isMonetary ? 15 : 14,
										color: isMonetary ? "primary.main" : "text.primary",
									}}
								>
									{display}
								</Typography>
							</Box>
						);
					})}
				</Stack>
			</DialogContent>
		</Dialog>
	);
}
