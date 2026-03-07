import { useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { Iconify } from "@/components/core";
import { GraphViewer } from "@/components/core/graph-viewer";
import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { usePrivacy } from "@/hooks/use-privacy";
import { investigate } from "@/services/helios-api";
import { fCurrency, fNumber, maskDoc, maskName } from "@/utils/format";

const SENSITIVE_KEYS = new Set([
	"nombre", "Nombre", "nombre_proveedor", "Nombre_Proveedor", "razon_social",
	"nombre_entidad", "Nombre_Entidad", "representante_legal", "Nombre_Representante_Legal",
	"ordenador_gasto", "Ordenador_Gasto", "proveedor", "Proveedor", "entidad", "Entidad",
]);
const SENSITIVE_DOC_KEYS = new Set([
	"documento", "Documento", "nit", "Nit", "nit_entidad", "Nit_Entidad",
	"documento_proveedor", "Documento_Proveedor", "identificacion", "cc",
]);

const RISK_CONFIG = {
	alto: { color: "error", label: "ALTO", icon: "solar:danger-bold" },
	medio: { color: "warning", label: "MEDIO", icon: "solar:shield-warning-bold" },
	bajo: { color: "success", label: "BAJO", icon: "solar:shield-check-bold" },
	sin_riesgo: { color: "info", label: "SIN RIESGO", icon: "solar:check-circle-bold" },
};

const SEVERITY_COLORS = {
	alta: "error",
	media: "warning",
	baja: "info",
	informativo: "default",
};

const SECTION_ICONS = {
	contracts_as_provider: "solar:bag-3-bold-duotone",
	contracts_as_entity: "solar:buildings-2-bold-duotone",
	contracts_as_representative: "solar:user-id-bold-duotone",
	contracts_as_ordering_authority: "solar:shield-user-bold-duotone",
	entity_force: "solar:flag-bold-duotone",
	rues_info: "solar:document-text-bold-duotone",
	rues_as_representative: "solar:user-check-bold-duotone",
	sanctions_disciplinary: "solar:danger-triangle-bold-duotone",
	sanctions_fiscal: "solar:banknote-2-bold-duotone",
	fiscal_reviewer: "solar:eye-bold-duotone",
};

export default function InvestigacionPage() {
	const { user } = useAuthContext();
	const { obfuscate, visibleChars, visibleLastChars, maskChar } = usePrivacy();

	const [documento, setDocumento] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	const handleSubmit = async () => {
		const trimmed = documento.trim();
		if (!trimmed) return;

		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const data = await investigate(trimmed, user?.email);
			if (data.error) {
				setError(data.error);
			} else {
				setResult(data);
			}
		} catch (err) {
			setError(err.message || "Error al procesar la investigación. Intenta de nuevo.");
		} finally {
			setLoading(false);
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !loading) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const { analysis, results, graph } = result || {};

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Investigación por CC/NIT</Typography>
				<Typography variant="body2" color="text.secondary">
					Ingresa un número de cédula o NIT para obtener un análisis completo de su actividad en
					contratación estatal.
				</Typography>
			</Stack>

			{/* Input */}
			<Card>
				<CardContent>
					<Stack direction="row" spacing={2} alignItems="flex-start">
						<TextField
							fullWidth
							value={documento}
							onChange={(e) => setDocumento(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Número de CC o NIT..."
							disabled={loading}
						/>
						<LoadingButton
							variant="contained"
							loading={loading}
							onClick={handleSubmit}
							disabled={!documento.trim()}
							startIcon={<Iconify icon="solar:magnifer-bold-duotone" />}
							sx={{ minWidth: 140 }}
						>
							Investigar
						</LoadingButton>
					</Stack>

					{loading && (
						<Stack spacing={1} sx={{ mt: 2 }}>
							<LinearProgress />
							<Typography variant="caption" color="text.secondary">
								Recopilando información de múltiples fuentes... Esto puede tomar entre 5 y 20 segundos.
							</Typography>
						</Stack>
					)}
				</CardContent>
			</Card>

			{error && (
				<Alert severity="error" variant="outlined">
					{error}
				</Alert>
			)}

			{result?.message && !error && (
				<Alert severity="info" variant="outlined">
					{result.message}
				</Alert>
			)}

			{analysis && (
				<Stack spacing={3}>
					{/* Risk level */}
					{analysis.nivel_riesgo && (
						<Box sx={{ display: "flex", justifyContent: "center" }}>
							<Chip
								icon={<Iconify icon={RISK_CONFIG[analysis.nivel_riesgo]?.icon || "solar:info-circle-bold"} width={22} />}
								label={`Nivel de riesgo: ${RISK_CONFIG[analysis.nivel_riesgo]?.label || analysis.nivel_riesgo}`}
								color={RISK_CONFIG[analysis.nivel_riesgo]?.color || "default"}
								sx={{ fontSize: 16, fontWeight: 700, py: 2.5, px: 2, height: "auto" }}
							/>
						</Box>
					)}

					{/* Executive summary */}
					{analysis.resumen_ejecutivo && (
						<Card sx={{ borderLeft: 4, borderColor: "secondary.main" }}>
							<CardContent>
								<Stack spacing={1.5}>
									<Stack direction="row" spacing={1} alignItems="center">
										<Iconify icon="solar:document-bold-duotone" width={22} sx={{ color: "secondary.main" }} />
										<Typography variant="subtitle1">Resumen ejecutivo</Typography>
									</Stack>
									<Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
										{analysis.resumen_ejecutivo}
									</Typography>
								</Stack>
							</CardContent>
						</Card>
					)}

					{/* Profile */}
					{analysis.perfil && <ProfileSection perfil={analysis.perfil} obfuscate={obfuscate} visibleChars={visibleChars} visibleLastChars={visibleLastChars} maskChar={maskChar} />}

					{/* Statistics */}
					{analysis.estadisticas && <StatisticsSection stats={analysis.estadisticas} />}

					{/* Hallazgos */}
					{analysis.hallazgos?.length > 0 && <HallazgosSection hallazgos={analysis.hallazgos} />}

					{/* Investigation sections */}
					{results && <SectionsAccordion results={results} obfuscate={obfuscate} visibleChars={visibleChars} visibleLastChars={visibleLastChars} maskChar={maskChar} />}

					{/* Recommendations */}
					{analysis.recomendaciones?.length > 0 && (
						<Card>
							<CardContent>
								<Stack spacing={2}>
									<Stack direction="row" spacing={1} alignItems="center">
										<Iconify icon="solar:lightbulb-bolt-bold-duotone" width={22} sx={{ color: "warning.main" }} />
										<Typography variant="subtitle1">Recomendaciones</Typography>
									</Stack>
									<List dense disablePadding>
										{analysis.recomendaciones.map((rec, idx) => (
											<ListItem key={idx} disableGutters>
												<ListItemIcon sx={{ minWidth: 32 }}>
													<Iconify icon="solar:arrow-right-bold" width={16} sx={{ color: "warning.main" }} />
												</ListItemIcon>
												<ListItemText primary={rec} primaryTypographyProps={{ variant: "body2" }} />
											</ListItem>
										))}
									</List>
								</Stack>
							</CardContent>
						</Card>
					)}

					{/* Graph */}
					{graph?.nodes?.length > 0 && (
						<Card>
							<CardContent>
								<Stack spacing={2}>
									<Stack direction="row" spacing={1} alignItems="center">
										<Iconify icon="solar:chart-2-bold-duotone" width={22} sx={{ color: "secondary.main" }} />
										<Typography variant="subtitle1">Red de relaciones</Typography>
										<Chip label={`${graph.nodes.length} nodos`} size="small" variant="outlined" />
									</Stack>
									<GraphViewer data={graph} height={550} />
								</Stack>
							</CardContent>
						</Card>
					)}
				</Stack>
			)}
		</Stack>
	);
}

// ---------------------------------------------------------------------------

function ProfileSection({ perfil, obfuscate, visibleChars, visibleLastChars, maskChar }) {
	return (
		<Card>
			<CardContent>
				<Stack spacing={2}>
					<Stack direction="row" spacing={1} alignItems="center">
						<Iconify icon="solar:user-bold-duotone" width={22} sx={{ color: "primary.main" }} />
						<Typography variant="subtitle1">Perfil</Typography>
					</Stack>

					<Grid container spacing={2}>
						{perfil.tipo && (
							<Grid size={{ xs: 12, sm: 4 }}>
								<Typography variant="caption" color="text.disabled">Tipo</Typography>
								<Typography variant="body2" fontWeight={600}>{perfil.tipo}</Typography>
							</Grid>
						)}
						{perfil.nombre && (
							<Grid size={{ xs: 12, sm: 4 }}>
								<Typography variant="caption" color="text.disabled">Nombre</Typography>
								<Typography variant="body2" fontWeight={600}>
								{obfuscate ? maskName(perfil.nombre, visibleChars, maskChar) : perfil.nombre}
							</Typography>
							</Grid>
						)}
						{perfil.documento && (
							<Grid size={{ xs: 12, sm: 4 }}>
								<Typography variant="caption" color="text.disabled">Documento</Typography>
								<Typography variant="body2" fontWeight={600}>
								{obfuscate ? maskDoc(perfil.documento, visibleLastChars, maskChar) : perfil.documento}
							</Typography>
							</Grid>
						)}
					</Grid>

					{perfil.roles_detectados?.length > 0 && (
						<Stack spacing={1}>
							<Typography variant="caption" color="text.disabled">Roles detectados</Typography>
							<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
								{perfil.roles_detectados.map((rol) => (
									<Chip key={rol} label={rol} size="small" color="primary" variant="outlined" />
								))}
							</Stack>
						</Stack>
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}

function StatisticsSection({ stats }) {
	const cards = [
		{ label: "Total contratos", value: fNumber(stats.total_contratos), icon: "solar:document-text-bold-duotone", color: "primary" },
		{ label: "Valor total estimado", value: fCurrency(stats.valor_total_estimado), icon: "solar:wallet-money-bold-duotone", color: "secondary" },
		{ label: "Entidades relacionadas", value: fNumber(stats.entidades_relacionadas), icon: "solar:buildings-2-bold-duotone", color: "info" },
		{ label: "Período", value: stats.periodo || "—", icon: "solar:calendar-bold-duotone", color: "success" },
	];

	const extras = [];
	if (stats.ciudades_operacion?.length) {
		extras.push({ label: "Ciudades de operación", value: stats.ciudades_operacion.join(", ") });
	}
	if (stats.fuerzas_relacionadas?.length) {
		extras.push({ label: "Fuerzas relacionadas", value: stats.fuerzas_relacionadas.join(", ") });
	}

	return (
		<Stack spacing={2}>
			<Stack direction="row" spacing={1} alignItems="center">
				<Iconify icon="solar:chart-bold-duotone" width={22} sx={{ color: "info.main" }} />
				<Typography variant="subtitle1">Estadísticas</Typography>
			</Stack>

			<Grid container spacing={2}>
				{cards.map((c) => (
					<Grid key={c.label} size={{ xs: 6, md: 3 }}>
						<Card sx={{ height: "100%" }}>
							<CardContent>
								<Stack spacing={1} alignItems="center" textAlign="center">
									<Box
										sx={{
											width: 48,
											height: 48,
											borderRadius: 2,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											bgcolor: `${c.color}.lighter`,
										}}
									>
										<Iconify icon={c.icon} width={24} sx={{ color: `${c.color}.main` }} />
									</Box>
									<Typography variant="h5">{c.value}</Typography>
									<Typography variant="caption" color="text.secondary">{c.label}</Typography>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				))}
			</Grid>

			{extras.length > 0 && (
				<Card variant="outlined">
					<CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
						<Stack spacing={1} divider={<Divider />}>
							{extras.map((e) => (
								<Stack key={e.label} direction="row" justifyContent="space-between" alignItems="center">
									<Typography variant="body2" color="text.secondary">{e.label}</Typography>
									<Typography variant="body2" fontWeight={600}>{e.value}</Typography>
								</Stack>
							))}
						</Stack>
					</CardContent>
				</Card>
			)}
		</Stack>
	);
}

function HallazgosSection({ hallazgos }) {
	return (
		<Stack spacing={2}>
			<Stack direction="row" spacing={1} alignItems="center">
				<Iconify icon="solar:flag-2-bold-duotone" width={22} sx={{ color: "error.main" }} />
				<Typography variant="subtitle1">Hallazgos</Typography>
				<Chip label={hallazgos.length} size="small" color="error" />
			</Stack>

			<Stack spacing={2}>
				{hallazgos.map((h, idx) => {
					const chipColor = SEVERITY_COLORS[h.severidad] || "default";
					return (
						<Card
							key={idx}
							sx={{
								borderLeft: 4,
								borderColor: chipColor === "default" ? "grey.400" : `${chipColor}.main`,
							}}
						>
							<CardContent>
								<Stack spacing={1.5}>
									<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
										{h.categoria && <Chip label={h.categoria} size="small" color={chipColor} />}
										{h.severidad && (
											<Chip
												label={`Severidad: ${h.severidad}`}
												size="small"
												variant="outlined"
												color={chipColor}
											/>
										)}
									</Stack>
									{h.descripcion && (
										<Typography variant="body2">{h.descripcion}</Typography>
									)}
									{h.evidencia && (
										<Box sx={{ p: 1.5, borderRadius: 1, bgcolor: "grey.50", border: "1px solid", borderColor: "grey.200" }}>
											<Typography variant="caption" color="text.secondary" component="div" sx={{ whiteSpace: "pre-line" }}>
												{h.evidencia}
											</Typography>
										</Box>
									)}
								</Stack>
							</CardContent>
						</Card>
					);
				})}
			</Stack>
		</Stack>
	);
}

function SectionsAccordion({ results, obfuscate, visibleChars, visibleLastChars, maskChar }) {
	const sectionKeys = Object.keys(results);
	if (!sectionKeys.length) return null;

	return (
		<Stack spacing={2}>
			<Stack direction="row" spacing={1} alignItems="center">
				<Iconify icon="solar:folder-open-bold-duotone" width={22} sx={{ color: "primary.main" }} />
				<Typography variant="subtitle1">Secciones de investigación</Typography>
			</Stack>

			{sectionKeys.map((key) => {
				const section = results[key];
				if (!section) return null;

				const icon = SECTION_ICONS[key] || "solar:document-bold-duotone";

				return (
					<Accordion key={key} disableGutters variant="outlined" sx={{ "&:before": { display: "none" } }}>
						<AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={18} />}>
							<Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
								<Iconify icon={icon} width={20} sx={{ color: section.found ? "success.main" : "grey.400" }} />
								<Typography variant="subtitle2" sx={{ flex: 1 }}>
									{section.label || key}
								</Typography>
								{section.found ? (
									<Iconify icon="solar:check-circle-bold" width={20} sx={{ color: "success.main" }} />
								) : (
									<Iconify icon="solar:close-circle-bold" width={20} sx={{ color: "grey.400" }} />
								)}
							</Stack>
						</AccordionSummary>

						<AccordionDetails>
							{section.error && (
								<Alert severity="error" variant="outlined" sx={{ mb: 1 }}>
									{section.error}
								</Alert>
							)}

							{section.found && section.data ? (
								<DataRenderer data={section.data} obfuscate={obfuscate} visibleChars={visibleChars} visibleLastChars={visibleLastChars} maskChar={maskChar} />
							) : (
								<Typography variant="body2" color="text.disabled">
									No se encontró información en esta sección.
								</Typography>
							)}
						</AccordionDetails>
					</Accordion>
				);
			})}
		</Stack>
	);
}

function DataRenderer({ data, obfuscate, visibleChars, visibleLastChars, maskChar }) {
	function renderValue(k, v) {
		if (v == null) return "—";
		if (typeof v === "object") return JSON.stringify(v);
		const str = String(v);
		if (!obfuscate) return str;
		if (SENSITIVE_KEYS.has(k)) return maskName(str, visibleChars, maskChar);
		if (SENSITIVE_DOC_KEYS.has(k)) return maskDoc(str, visibleLastChars, maskChar);
		return str;
	}
	if (Array.isArray(data)) {
		return (
			<Stack spacing={1}>
				{data.map((item, idx) => (
					<Paper key={idx} variant="outlined" sx={{ p: 1.5 }}>
						{typeof item === "object" && item !== null ? (
							<Stack spacing={0.5}>
								{Object.entries(item).map(([k, v]) => (
									<Stack key={k} direction="row" spacing={1}>
										<Typography variant="caption" color="text.disabled" sx={{ minWidth: 140, fontWeight: 600 }}>
											{k}:
										</Typography>
										<Typography variant="caption">
											{renderValue(k, v)}
										</Typography>
									</Stack>
								))}
							</Stack>
						) : (
							<Typography variant="body2">{String(item)}</Typography>
						)}
					</Paper>
				))}
			</Stack>
		);
	}

	if (typeof data === "object" && data !== null) {
		return (
			<Stack spacing={0.5}>
				{Object.entries(data).map(([k, v]) => (
					<Stack key={k} direction="row" spacing={1}>
						<Typography variant="caption" color="text.disabled" sx={{ minWidth: 140, fontWeight: 600 }}>
							{k}:
						</Typography>
						<Typography variant="caption">
							{renderValue(k, v)}
						</Typography>
					</Stack>
				))}
			</Stack>
		);
	}

	return <Typography variant="body2">{String(data)}</Typography>;
}
