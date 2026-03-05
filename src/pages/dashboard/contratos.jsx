import { useState, useEffect, useCallback } from "react";

import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
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

const SUMMARY_CARDS = [
	{ key: "total_contratos", label: "Total Contratos", icon: "solar:document-bold-duotone", color: PRIMARY, format: fNumber },
	{ key: "total_proveedores", label: "Total Proveedores", icon: "solar:users-group-rounded-bold-duotone", color: "#5C6BC0", format: fNumber },
	{ key: "total_entidades", label: "Total Entidades", icon: "solar:buildings-bold-duotone", color: "#4A6741", format: fNumber },
	{ key: "total_departamentos", label: "Total Departamentos", icon: "solar:map-bold-duotone", color: "#29B6F6", format: fNumber },
	{ key: "valor_total", label: "Valor Total", icon: "solar:wallet-money-bold-duotone", color: SECONDARY, format: fCurrency },
];

const CONTRACT_COLUMNS = [
	{ key: "Descripcion_del_Proceso", label: "Descripción" },
	{ key: "Nombre_Entidad", label: "Entidad" },
	{ key: "Estado_del_Proceso", label: "Estado" },
	{ key: "Tipo_de_Contrato", label: "Tipo" },
	{ key: "Valor_Total", label: "Valor", align: "right", format: fCurrency },
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

export default function ContratosPage() {
	const [fuerzas, setFuerzas] = useState([]);
	const [anios, setAnios] = useState([]);

	const [filters, setFilters] = useState({
		fuerza: "",
		ano: "",
		entidad: "",
		ciudad: "",
		proveedor: "",
		documento: "",
		limit: 30,
	});

	const [searching, setSearching] = useState(false);
	const [error, setError] = useState(null);
	const [result, setResult] = useState(null);

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

	const summary = result?.summary?.resultSet?.[0] || null;
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
									<MenuItem value="">
										<em>Todos</em>
									</MenuItem>
									{anios.map((a) => (
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

			{/* ─── Grafo ──────────────────────────────────────────── */}
			{result && (
				<Card>
					<CardContent>
						<Typography variant="h6" sx={{ mb: 2 }}>
							Grafo de relaciones
						</Typography>
						<GraphViewer data={graphData} height={500} />
					</CardContent>
				</Card>
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
												{CONTRACT_COLUMNS.map((col) => (
													<TableCell key={col.key} align={col.align || "left"}>
														{col.format ? col.format(props[col.key]) : props[col.key] ?? "—"}
													</TableCell>
												))}
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
