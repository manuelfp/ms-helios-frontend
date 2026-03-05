import { useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import Paper from "@mui/material/Paper";
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

	const handleSubmit = async () => {
		const trimmed = question.trim();
		if (!trimmed) return;

		setLoading(true);
		setError(null);
		setResult(null);

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

					{/* Graph visualization */}
					{result.graph_data?.type === "graph" && result.graph_data.nodes?.length > 0 && (
						<Card>
							<CardContent>
								<Stack spacing={2}>
									<Stack direction="row" spacing={1} alignItems="center">
										<Iconify icon="solar:chart-2-bold-duotone" width={22} sx={{ color: "secondary.main" }} />
										<Typography variant="subtitle1">Visualización de grafo</Typography>
										<Chip label={`${result.graph_data.nodes.length} nodos`} size="small" variant="outlined" />
									</Stack>

									<GraphViewer data={result.graph_data} height={500} />
								</Stack>
							</CardContent>
						</Card>
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

function ResultsTable({ data }) {
	if (!data?.length) return null;

	const columns = Object.keys(data[0]);

	const formatCell = (value) => {
		if (value == null) return "—";
		if (typeof value === "number") {
			if (Math.abs(value) > 100_000) return fCurrency(value);
			return fNumber(value);
		}
		if (typeof value === "object") return JSON.stringify(value);
		return String(value);
	};

	return (
		<TableContainer component={Paper} variant="outlined">
			<Table size="small">
				<TableHead>
					<TableRow>
						{columns.map((col) => (
							<TableCell key={col} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
								{col}
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{data.map((row, idx) => (
						<TableRow key={idx} hover>
							{columns.map((col) => (
								<TableCell key={col} sx={{ whiteSpace: "nowrap", maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis" }}>
									{formatCell(row[col])}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
