import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
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
import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { naturalQuery } from "@/services/helios-api";
import { fCurrency, fNumber } from "@/utils/format";

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

const NODE_TYPE_META = {
	CONTRATOS: { label: "Contrato", icon: "solar:document-bold-duotone", color: "#F2A900" },
	NITS: { label: "Entidad / NIT", icon: "solar:buildings-bold-duotone", color: "#5C6BC0" },
	DEPARTAMENTO: { label: "Departamento", icon: "solar:map-bold-duotone", color: "#66BB6A" },
	DEPARTAMENTOS_CONTRATOS: { label: "Departamento", icon: "solar:map-bold-duotone", color: "#66BB6A" },
	CIUDAD: { label: "Ciudad", icon: "solar:map-point-bold-duotone", color: "#29B6F6" },
	PROVEEDOR: { label: "Proveedor", icon: "solar:user-bold-duotone", color: "#EF5350" },
	ADJUDICADOR: { label: "Adjudicador", icon: "solar:user-check-bold-duotone", color: "#AB47BC" },
	FUERZA: { label: "Fuerza", icon: "solar:shield-bold-duotone", color: "#4A6741" },
	ENTIDADES_CONTRATOS: { label: "Entidad", icon: "solar:buildings-bold-duotone", color: "#5C6BC0" },
};

const PROP_LABELS = {
	Objeto: "Descripción / Objeto",
	Entidad: "Entidad",
	Proveedor: "Proveedor",
	Estado_Contrato: "Estado",
	Tipo_Contrato: "Tipo de contrato",
	Justificacion_Modalidad: "Modalidad",
	Valor_Contrato: "Valor contrato",
	Documento_Proveedor: "Doc. Proveedor",
	Nit_Entidad: "NIT Entidad",
	Ciudad: "Ciudad",
	Departamento: "Departamento",
	Fecha_Firma: "Fecha de firma",
	Ano_Firma: "Año de firma",
	Ref_Contrato: "Ref. Contrato",
	id_contrato: "ID Contrato",
	Nombre_Representante_Legal: "Representante legal",
	Ordenador_Gasto: "Ordenador del gasto",
	nombre: "Nombre",
	Nombre: "Nombre",
	Nombre_Entidad: "Nombre Entidad",
	nit_entidad: "NIT Entidad",
	Fuerza: "Fuerza",
};

const HIDDEN_PROPS = new Set(["Id_Url", "Codigo_Proveedor"]);

function formatPropValue(key, rawValue) {
	const value = resolveNeo4jValue(rawValue);
	if (value == null || value === "") return "—";
	if (typeof value === "object") return JSON.stringify(value);
	if (key.toLowerCase().includes("valor") && typeof value === "number") return fCurrency(value);
	return String(value);
}

function NodeDetailCard({ node, onClose }) {
	const group = node.group || (node.labels && node.labels[0]) || "OTRO";
	const meta = NODE_TYPE_META[group] || { label: group, icon: "solar:info-circle-bold-duotone", color: "#919EAB" };
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
						<Typography variant="subtitle1" fontWeight={700}>{meta.label}</Typography>
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
									{PROP_LABELS[key] || key.replace(/_/g, " ")}
								</Typography>
								<Typography
									variant="body2"
									sx={{ wordBreak: "break-word", fontWeight: key.toLowerCase().includes("valor") ? 600 : 400 }}
								>
									{formatPropValue(key, value)}
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

const EXAMPLE_QUESTIONS = [
	"¿Cuáles son los 5 proveedores con más contratos en 2025?",
	"¿Cuánto se contrató en el Ejército Nacional en 2024?",
	"¿Qué entidades tienen más contratos por contratación directa?",
];

export default function ConsultaIAPage() {
	const { user } = useAuthContext();

	const [question, setQuestion] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);
	const [showQueries, setShowQueries] = useState(false);
	const [selectedNode, setSelectedNode] = useState(null);

	const handleSubmit = async () => {
		const trimmed = question.trim();
		if (!trimmed) return;

		setLoading(true);
		setError(null);
		setResult(null);
		setSelectedNode(null);

		try {
			const data = await naturalQuery(trimmed, user?.email);
			if (data.error) {
				setError(data.error);
			} else {
				setResult(data);
			}
		} catch (err) {
			setError(err.message || "Error al procesar la consulta. Intenta de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	const handleExampleClick = (q) => {
		setQuestion(q);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey && !loading) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Consulta con IA</Typography>
				<Typography variant="body2" color="text.secondary">
					Realiza preguntas en lenguaje natural sobre contratación estatal. Gemini AI generará y ejecutará
					las consultas necesarias.
				</Typography>
			</Stack>

			<Card>
				<CardContent>
					<Stack spacing={2.5}>
						<TextField
							fullWidth
							multiline
							rows={2}
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Escribe tu pregunta sobre contratación estatal..."
							disabled={loading}
						/>

						<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
							<Typography variant="caption" color="text.disabled" sx={{ alignSelf: "center" }}>
								Ejemplos:
							</Typography>
							{EXAMPLE_QUESTIONS.map((q) => (
								<Chip
									key={q}
									label={q}
									size="small"
									variant="outlined"
									onClick={() => handleExampleClick(q)}
									sx={{ cursor: "pointer" }}
								/>
							))}
						</Stack>

						<Stack direction="row" alignItems="center" spacing={2}>
							<LoadingButton
								variant="contained"
								loading={loading}
								onClick={handleSubmit}
								disabled={!question.trim()}
								startIcon={<Iconify icon="solar:magic-stick-3-bold-duotone" />}
							>
								Consultar
							</LoadingButton>

							{loading && (
								<Stack direction="row" spacing={1} alignItems="center">
									<CircularProgress size={16} />
									<Typography variant="caption" color="text.secondary">
										Procesando con IA... Esto puede tomar entre 10 y 60 segundos.
									</Typography>
								</Stack>
							)}
						</Stack>
					</Stack>
				</CardContent>
			</Card>

			{error && (
				<Alert severity="error" variant="outlined">
					{error}
				</Alert>
			)}

			{result && (
				<Stack spacing={3}>
					{/* Cypher queries */}
					{result.queries && (
						<Card>
							<CardContent>
								<Stack spacing={1.5}>
									<Stack
										direction="row"
										alignItems="center"
										spacing={1}
										onClick={() => setShowQueries(!showQueries)}
										sx={{ cursor: "pointer" }}
									>
										<Iconify
											icon={showQueries ? "solar:alt-arrow-down-bold" : "solar:alt-arrow-right-bold"}
											width={18}
											sx={{ color: "text.secondary" }}
										/>
										<Typography variant="subtitle2" color="text.secondary">
											Consultas Cypher generadas
										</Typography>
									</Stack>

									<Collapse in={showQueries}>
										<Stack spacing={1.5}>
											{result.queries.query_for_response && (
												<Box
													component="pre"
													sx={{
														p: 2,
														borderRadius: 1.5,
														bgcolor: "grey.900",
														color: "common.white",
														fontSize: 13,
														fontFamily: "monospace",
														overflow: "auto",
														whiteSpace: "pre-wrap",
														wordBreak: "break-word",
														m: 0,
													}}
												>
													<Typography variant="caption" sx={{ color: "grey.500", display: "block", mb: 1 }}>
														// Consulta para datos
													</Typography>
													{result.queries.query_for_response}
												</Box>
											)}
											{result.queries.query_for_graph && (
												<Box
													component="pre"
													sx={{
														p: 2,
														borderRadius: 1.5,
														bgcolor: "grey.900",
														color: "common.white",
														fontSize: 13,
														fontFamily: "monospace",
														overflow: "auto",
														whiteSpace: "pre-wrap",
														wordBreak: "break-word",
														m: 0,
													}}
												>
													<Typography variant="caption" sx={{ color: "grey.500", display: "block", mb: 1 }}>
														// Consulta para grafo
													</Typography>
													{result.queries.query_for_graph}
												</Box>
											)}
										</Stack>
									</Collapse>
								</Stack>
							</CardContent>
						</Card>
					)}

					{/* Response data table */}
					{result.response_data?.type === "raw" && result.response_data.resultSet?.length > 0 && (
						<Card>
							<CardContent>
								<Stack spacing={2}>
									<Stack direction="row" spacing={1} alignItems="center">
										<Iconify icon="solar:document-text-bold-duotone" width={22} sx={{ color: "primary.main" }} />
										<Typography variant="subtitle1">Resultados</Typography>
										<Chip label={`${result.response_data.resultSet.length} registros`} size="small" />
									</Stack>

									<ResultsTable data={result.response_data.resultSet} />
								</Stack>
							</CardContent>
						</Card>
					)}

					{result.response_data?.type === "nodes" && result.response_data.nodes?.length > 0 && (
						<Card>
							<CardContent>
								<Stack spacing={2}>
									<Stack direction="row" spacing={1} alignItems="center">
										<Iconify icon="solar:document-text-bold-duotone" width={22} sx={{ color: "primary.main" }} />
										<Typography variant="subtitle1">Nodos encontrados</Typography>
										<Chip label={`${result.response_data.nodes.length} nodos`} size="small" />
									</Stack>

									<ResultsTable
										data={result.response_data.nodes.map((n) => ({
											id: n.id,
											grupo: n.group,
											...n.properties,
										}))}
									/>
								</Stack>
							</CardContent>
						</Card>
					)}

					{/* Graph visualization + node detail */}
					{result.graph_data?.type === "graph" && result.graph_data.nodes?.length > 0 && (
						<Grid container spacing={2}>
							<Grid size={{ xs: 12, md: selectedNode ? 8 : 12 }}>
								<Card sx={{ height: "100%" }}>
									<CardContent>
										<Stack spacing={2}>
											<Stack direction="row" spacing={1} alignItems="center">
												<Iconify icon="solar:chart-2-bold-duotone" width={22} sx={{ color: "secondary.main" }} />
												<Typography variant="subtitle1">Visualización de grafo</Typography>
												<Chip label={`${result.graph_data.nodes.length} nodos`} size="small" variant="outlined" />
											</Stack>

											<GraphViewer
												data={result.graph_data}
												height={500}
												onNodeClick={(node) =>
													setSelectedNode((prev) => (prev?.id === node.id ? null : node))
												}
												selectedNodeId={selectedNode?.id}
											/>
										</Stack>
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

					{/* No results */}
					{!result.response_data?.resultSet?.length &&
						!result.response_data?.nodes?.length &&
						!result.graph_data?.nodes?.length && (
							<Alert severity="info" variant="outlined">
								La consulta se ejecutó correctamente pero no retornó resultados.
							</Alert>
						)}
				</Stack>
			)}
		</Stack>
	);
}

// ---------------------------------------------------------------------------

function formatCell(colName, rawValue) {
	const value = resolveNeo4jValue(rawValue);
	if (value == null) return "—";
	if (typeof value === "number") {
		const lower = colName.toLowerCase();
		if (lower.includes("valor") || lower.includes("monto") || lower.includes("cuantia") || Math.abs(value) > 1_000_000)
			return fCurrency(value);
		return fNumber(value);
	}
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
}

function RowDetailDialog({ row, open, onClose }) {
	if (!row) return null;

	const entries = Object.entries(row).filter(([, v]) => v != null && v !== "");

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
			<DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pb: 1 }}>
				<Stack direction="row" alignItems="center" spacing={1}>
					<Iconify icon="solar:document-text-bold-duotone" width={24} sx={{ color: "primary.main" }} />
					<Typography variant="h6">Detalle del registro</Typography>
				</Stack>
				<IconButton size="small" onClick={onClose}>
					<Iconify icon="solar:close-circle-bold-duotone" width={22} />
				</IconButton>
			</DialogTitle>

			<Divider />

			<DialogContent sx={{ pt: 2 }}>
				<Stack spacing={2}>
					{entries.map(([key, value]) => {
						const resolved = resolveNeo4jValue(value);
						const label = PROP_LABELS[key] || key.replace(/_/g, " ");
						const isMonetary = key.toLowerCase().includes("valor") || key.toLowerCase().includes("monto") || key.toLowerCase().includes("cuantia");
						let display;
						if (resolved == null) display = "—";
						else if (typeof resolved === "number") display = isMonetary ? fCurrency(resolved) : fNumber(resolved);
						else if (typeof resolved === "object") display = JSON.stringify(resolved, null, 2);
						else display = String(resolved);

						return (
							<Box key={key}>
								<Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>
									{label}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										wordBreak: "break-word",
										fontWeight: isMonetary ? 600 : 400,
										whiteSpace: "pre-wrap",
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

function ResultsTable({ data }) {
	const [detailRow, setDetailRow] = useState(null);

	if (!data?.length) return null;

	const columns = Object.keys(data[0]);

	return (
		<>
			<TableContainer component={Paper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell sx={{ fontWeight: 600, width: 48 }} />
							{columns.map((col) => (
								<TableCell key={col} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
									{PROP_LABELS[col] || col.replace(/_/g, " ")}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					<TableBody>
						{data.map((row, idx) => (
							<TableRow key={idx} hover>
								<TableCell sx={{ px: 0.5 }}>
									<Tooltip title="Ver detalle" arrow>
										<IconButton size="small" onClick={() => setDetailRow(row)} sx={{ color: "primary.main" }}>
											<Iconify icon="solar:eye-bold-duotone" width={20} />
										</IconButton>
									</Tooltip>
								</TableCell>
								{columns.map((col) => (
									<TableCell key={col} sx={{ whiteSpace: "nowrap", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis" }}>
										{formatCell(col, row[col])}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			<RowDetailDialog row={detailRow} open={!!detailRow} onClose={() => setDetailRow(null)} />
		</>
	);
}
