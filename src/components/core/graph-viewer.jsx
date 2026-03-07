import { useCallback, useEffect, useRef, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import ForceGraph2D from "react-force-graph-2d";

import { Iconify } from "@/components/core";
import { usePrivacy } from "@/hooks/use-privacy";
import { maskName, maskDoc, fCurrency } from "@/utils/format";

const SENSITIVE_GRAPH_GROUPS = new Set([
	"PROVEEDOR", "NITS", "ADJUDICADOR", "REPRESENTANTE_LEGAL", "REVISOR_FISCAL",
	"RUES", "SANCION_DISCIPLINARIA", "SANCION_FISCAL",
]);

const NODE_COLORS = {
	CONTRATOS: "#F2A900",
	NITS: "#5C6BC0",
	DEPARTAMENTO: "#66BB6A",
	CIUDAD: "#29B6F6",
	PROVEEDOR: "#EF5350",
	ADJUDICADOR: "#AB47BC",
	FUERZA: "#4A6741",
	RUES: "#FF7043",
	SANCION_DISCIPLINARIA: "#E53935",
	SANCION_FISCAL: "#C62828",
	REPRESENTANTE_LEGAL: "#7E57C2",
	REVISOR_FISCAL: "#26A69A",
	ENTIDADES_CONTRATOS: "#5B8DBE",
	DEPARTAMENTOS_CONTRATOS: "#66BB6A",
};

const LEGEND_LABELS = {
	CONTRATOS: "Contratos",
	NITS: "NIT / Documento",
	DEPARTAMENTO: "Departamento",
	CIUDAD: "Ciudad",
	PROVEEDOR: "Proveedor",
	ADJUDICADOR: "Adjudicador",
	FUERZA: "Fuerza",
	RUES: "RUES",
	SANCION_DISCIPLINARIA: "Sanción Disciplinaria",
	SANCION_FISCAL: "Sanción Fiscal",
	REPRESENTANTE_LEGAL: "Rep. Legal",
	REVISOR_FISCAL: "Revisor Fiscal",
	ENTIDADES_CONTRATOS: "Entidad",
	DEPARTAMENTOS_CONTRATOS: "Departamento",
};

const NODE_TYPE_META = {
	CONTRATOS: { label: "Contrato", icon: "solar:document-bold-duotone" },
	NITS: { label: "Entidad / NIT", icon: "solar:buildings-bold-duotone" },
	DEPARTAMENTO: { label: "Departamento", icon: "solar:map-bold-duotone" },
	CIUDAD: { label: "Ciudad", icon: "solar:map-point-bold-duotone" },
	PROVEEDOR: { label: "Proveedor", icon: "solar:user-bold-duotone" },
	ADJUDICADOR: { label: "Adjudicador", icon: "solar:user-check-bold-duotone" },
	FUERZA: { label: "Fuerza", icon: "solar:shield-bold-duotone" },
	RUES: { label: "RUES", icon: "solar:notebook-bold-duotone" },
	SANCION_DISCIPLINARIA: { label: "Sanción Disciplinaria", icon: "solar:danger-bold-duotone" },
	SANCION_FISCAL: { label: "Sanción Fiscal", icon: "solar:danger-bold-duotone" },
	REPRESENTANTE_LEGAL: { label: "Rep. Legal", icon: "solar:user-id-bold-duotone" },
	REVISOR_FISCAL: { label: "Revisor Fiscal", icon: "solar:user-id-bold-duotone" },
	ENTIDADES_CONTRATOS: { label: "Entidad", icon: "solar:buildings-bold-duotone" },
	DEPARTAMENTOS_CONTRATOS: { label: "Departamento", icon: "solar:map-bold-duotone" },
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

function resolveNeo4jValue(val) {
	if (val == null) return val;
	if (typeof val === "object" && "low" in val && "high" in val) return val.low;
	if (typeof val === "object" && "year" in val) {
		const y = val.year?.low ?? val.year;
		const m = val.month?.low ?? val.month;
		const d = val.day?.low ?? val.day;
		return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
	}
	return val;
}

function neo4jInt(val) {
	if (val != null && typeof val === "object" && "low" in val) return val.low;
	return typeof val === "number" ? val : 0;
}

function getNodeColor(node) {
	const label = node.group || (node.labels && node.labels[0]) || "default";
	return NODE_COLORS[label] || "#919EAB";
}

function getNodeGroup(node) {
	return node.group || (node.labels && node.labels[0]) || "";
}

function getNodeLabel(node) {
	const props = node.properties || {};
	const group = getNodeGroup(node);

	if (group === "CONTRATOS") {
		const valor = neo4jInt(props.Valor_Contrato);
		return valor ? fCurrency(valor) : props.Ref_Contrato || node.id?.slice(-6);
	}

	return (
		props.Nombre_Proveedor ||
		props.Nombre_Entidad ||
		props.nombre ||
		props.Nombre ||
		props.Descripcion_del_Proceso ||
		props.razon_social ||
		node.group ||
		node.id?.slice(-6)
	);
}

function formatPropValue(key, rawValue, obfuscateFlag, visibleChars, visibleLastChars, mChar) {
	const value = resolveNeo4jValue(rawValue);
	if (value == null || value === "") return "—";
	if (typeof value === "object") return JSON.stringify(value);
	if (key.toLowerCase().includes("valor") && typeof value === "number") return fCurrency(value);
	if (key.toLowerCase().includes("url") && typeof value === "string" && value.startsWith("HTTP"))
		return value;
	const str = String(value);
	if (obfuscateFlag) {
		if (SENSITIVE_NAME_KEYS.has(key)) return maskName(str, visibleChars, mChar);
		if (SENSITIVE_DOC_KEYS.has(key)) return maskDoc(str, visibleLastChars, mChar);
	}
	return str;
}

// ─── Node detail panel (used inside expanded mode) ──────────────────
function NodeDetailPanel({ node, onClose }) {
	const { obfuscate, visibleChars, visibleLastChars, maskChar } = usePrivacy();
	const group = getNodeGroup(node);
	const meta = NODE_TYPE_META[group] || { label: group, icon: "solar:info-circle-bold-duotone" };
	const color = NODE_COLORS[group] || "#919EAB";
	const props = node.properties || {};
	const entries = Object.entries(props).filter(
		([k, v]) => v != null && v !== "" && !HIDDEN_PROPS.has(k),
	);

	return (
		<Card
			sx={{
				width: 380,
				maxHeight: "calc(100vh - 32px)",
				display: "flex",
				flexDirection: "column",
				borderTop: 3,
				borderColor: color,
				boxShadow: 6,
			}}
		>
			<CardContent sx={{ pb: 1 }}>
				<Stack direction="row" alignItems="center" justifyContent="space-between">
					<Stack direction="row" alignItems="center" spacing={1}>
						<Iconify icon={meta.icon} width={24} sx={{ color }} />
						<Typography variant="subtitle1" fontWeight={700}>{meta.label}</Typography>
					</Stack>
					<IconButton size="small" onClick={onClose}>
						<Iconify icon="solar:close-circle-bold-duotone" width={20} />
					</IconButton>
				</Stack>
				{node.labels?.length > 0 && (
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
						{entries.map(([key, value]) => {
							const formatted = formatPropValue(key, value, obfuscate, visibleChars, visibleLastChars, maskChar);
							const isUrl = key.toLowerCase().includes("url") && typeof formatted === "string" && formatted.startsWith("HTTP");
							return (
								<Box key={key}>
									<Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
										{PROPERTY_LABELS[key] || key.replace(/_/g, " ")}
									</Typography>
									{isUrl ? (
										<Typography
											variant="body2"
											component="a"
											href={formatted}
											target="_blank"
											rel="noopener noreferrer"
											sx={{ display: "block", wordBreak: "break-all", color: "primary.main" }}
										>
											Ver en SECOP
										</Typography>
									) : (
										<Typography
											variant="body2"
											sx={{ wordBreak: "break-word", fontWeight: key.toLowerCase().includes("valor") ? 600 : 400 }}
										>
											{formatted}
										</Typography>
									)}
								</Box>
							);
						})}
					</Stack>
				)}
			</Box>
		</Card>
	);
}

// ─── Controls ───────────────────────────────────────────────────────
const ZOOM_STEP = 1.5;

function ControlButton({ icon, tooltip, onClick }) {
	return (
		<Tooltip title={tooltip} placement="left" arrow>
			<IconButton
				size="small"
				onClick={onClick}
				sx={{
					bgcolor: "background.paper",
					boxShadow: 2,
					width: 36,
					height: 36,
					"&:hover": { bgcolor: "grey.100" },
				}}
			>
				<Iconify icon={icon} width={20} />
			</IconButton>
		</Tooltip>
	);
}

// ─── Graph canvas (reused inline + expanded) ────────────────────────
function GraphCanvas({ fgRef, graphData, height, paintNode, onNodeClick, activeGroups }) {
	useEffect(() => {
		const fg = fgRef.current;
		if (!fg || !graphData.nodes.length) return;

		fg.d3Force("charge")?.strength(-300).distanceMax(500);
		fg.d3Force("link")?.distance(120);
		fg.d3Force("center")?.strength(0.05);

		fg.d3ReheatSimulation();
		setTimeout(() => fg.zoomToFit(400, 60), 800);
	}, [fgRef, graphData.nodes.length]);

	const handleZoomIn = useCallback(() => {
		fgRef.current?.zoom((fgRef.current?.zoom() || 1) * ZOOM_STEP, 300);
	}, [fgRef]);

	const handleZoomOut = useCallback(() => {
		fgRef.current?.zoom((fgRef.current?.zoom() || 1) / ZOOM_STEP, 300);
	}, [fgRef]);

	const handleZoomFit = useCallback(() => {
		fgRef.current?.zoomToFit(400, 60);
	}, [fgRef]);

	const handleCenter = useCallback(() => {
		fgRef.current?.centerAt(0, 0, 400);
		setTimeout(() => fgRef.current?.zoomToFit(400, 60), 450);
	}, [fgRef]);

	return (
		<>
			<ForceGraph2D
				ref={fgRef}
				graphData={graphData}
				nodeCanvasObject={paintNode}
				nodePointerAreaPaint={(node, color, ctx) => {
					ctx.beginPath();
					ctx.arc(node.x, node.y, 10, 0, 2 * Math.PI);
					ctx.fillStyle = color;
					ctx.fill();
				}}
				onNodeClick={onNodeClick}
				linkColor={() => "rgba(0,0,0,0.15)"}
				linkWidth={0.8}
				linkDirectionalArrowLength={3}
				linkDirectionalArrowRelPos={1}
				width={undefined}
				height={height}
				cooldownTicks={120}
				onEngineStop={() => fgRef.current?.zoomToFit(400, 60)}
			/>

			<Stack spacing={0.5} sx={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
				<ControlButton icon="mdi:plus" tooltip="Acercar" onClick={handleZoomIn} />
				<ControlButton icon="mdi:minus" tooltip="Alejar" onClick={handleZoomOut} />
				<ControlButton icon="mdi:fit-to-screen-outline" tooltip="Ajustar a pantalla" onClick={handleZoomFit} />
				<ControlButton icon="mdi:crosshairs-gps" tooltip="Centrar grafo" onClick={handleCenter} />
			</Stack>

			{activeGroups.length > 0 && (
				<Stack
					direction="row"
					flexWrap="wrap"
					gap={0.5}
					sx={{
						position: "absolute",
						bottom: 8,
						left: 8,
						right: 8,
						zIndex: 10,
						px: 1,
						py: 0.5,
						bgcolor: "rgba(255,255,255,0.85)",
						backdropFilter: "blur(4px)",
						borderRadius: 1,
					}}
				>
					{activeGroups.map((group) => (
						<Chip
							key={group}
							label={LEGEND_LABELS[group] || group}
							size="small"
							sx={{ height: 22, fontSize: 11, bgcolor: NODE_COLORS[group], color: "#fff", fontWeight: 600 }}
						/>
					))}
					<Chip
						label={`${graphData.nodes.length} nodos · ${graphData.links.length} enlaces`}
						size="small"
						variant="outlined"
						sx={{ height: 22, fontSize: 11 }}
					/>
				</Stack>
			)}
		</>
	);
}

// ─── Main export ────────────────────────────────────────────────────
export function GraphViewer({ data, height = 500, sx, onNodeClick, selectedNodeId }) {
	const fgRef = useRef();
	const fgExpandedRef = useRef();
	const [expanded, setExpanded] = useState(false);
	const [detailNode, setDetailNode] = useState(null);
	const { obfuscate, visibleChars, maskChar } = usePrivacy();

	const graphData = useMemo(() => ({
		nodes: (data?.nodes || []).map((n) => ({ ...n, color: getNodeColor(n) })),
		links: (data?.links || []).map((l) => ({ ...l })),
	}), [data]);

	const activeGroups = useMemo(() => {
		const groups = new Set();
		graphData.nodes.forEach((n) => groups.add(getNodeGroup(n)));
		return [...groups].filter((g) => g && NODE_COLORS[g]);
	}, [graphData.nodes]);

	const handleInlineNodeClick = useCallback(
		(node) => { if (onNodeClick) onNodeClick(node); },
		[onNodeClick],
	);

	const handleExpandedNodeClick = useCallback((node) => {
		setDetailNode((prev) => (prev?.id === node.id ? null : node));
		if (onNodeClick) onNodeClick(node);
	}, [onNodeClick]);

	const paintNode = useCallback((node, ctx, globalScale) => {
		const rawLabel = getNodeLabel(node);
		const group = getNodeGroup(node);
		const label = obfuscate && SENSITIVE_GRAPH_GROUPS.has(group)
			? maskName(rawLabel, visibleChars, maskChar)
			: rawLabel;
		const fontSize = Math.max(10 / globalScale, 2);
		const isSelected = node.id === selectedNodeId || node.id === detailNode?.id;
		const radius = Math.max(5, Math.min(12, 4 + (node.val || 1))) * (isSelected ? 1.4 : 1);

		if (isSelected) {
			ctx.beginPath();
			ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI);
			ctx.fillStyle = "rgba(242, 169, 0, 0.2)";
			ctx.fill();
			ctx.strokeStyle = "#F2A900";
			ctx.lineWidth = 2 / globalScale;
			ctx.stroke();
		}

		ctx.beginPath();
		ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
		ctx.fillStyle = node.color || "#919EAB";
		ctx.fill();
		ctx.strokeStyle = isSelected ? "#F2A900" : "rgba(255,255,255,0.6)";
		ctx.lineWidth = (isSelected ? 2.5 : 1) / globalScale;
		ctx.stroke();

		const isContrato = group === "CONTRATOS";
		if ((globalScale > 0.8 || isSelected || isContrato) && label) {
			ctx.font = `${isSelected || isContrato ? "bold " : ""}${fontSize}px Inter, sans-serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.fillStyle = isSelected ? "#2E3B4E" : isContrato ? "#5D4600" : "#333";
			const maxLen = isContrato ? 42 : 25;
			const shortLabel = label.length > maxLen ? label.slice(0, maxLen - 3) + "…" : label;
			ctx.fillText(shortLabel, node.x, node.y + radius + 2);
		}
	}, [selectedNodeId, detailNode?.id, obfuscate, visibleChars, maskChar]);

	if (!graphData.nodes.length) {
		return (
			<Box sx={{ height, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.100", borderRadius: 2, ...sx }}>
				<Typography variant="body2" color="text.disabled">Sin datos de grafo para mostrar</Typography>
			</Box>
		);
	}

	return (
		<>
			{/* Inline graph */}
			<Box sx={{ height, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider", position: "relative", ...sx }}>
				<GraphCanvas
					fgRef={fgRef}
					graphData={graphData}
					height={height}
					paintNode={paintNode}
					onNodeClick={handleInlineNodeClick}
					activeGroups={activeGroups}
				/>

				<Tooltip title="Ampliar grafo" placement="left" arrow>
					<IconButton
						size="small"
						onClick={() => { setDetailNode(null); setExpanded(true); }}
						sx={{
							position: "absolute",
							top: 12,
							right: 56,
							zIndex: 10,
							bgcolor: "background.paper",
							boxShadow: 2,
							width: 36,
							height: 36,
							"&:hover": { bgcolor: "grey.100" },
						}}
					>
						<Iconify icon="mdi:fullscreen" width={22} />
					</IconButton>
				</Tooltip>
			</Box>

			{/* Fullscreen modal */}
			<Dialog
				open={expanded}
				onClose={() => { setExpanded(false); setDetailNode(null); }}
				maxWidth={false}
				fullScreen
				PaperProps={{ sx: { bgcolor: "#fafafa" } }}
			>
				<DialogContent sx={{ p: 0, position: "relative", overflow: "hidden" }}>
					<GraphCanvas
						fgRef={fgExpandedRef}
						graphData={graphData}
						height={typeof window !== "undefined" ? window.innerHeight : 800}
						paintNode={paintNode}
						onNodeClick={handleExpandedNodeClick}
						activeGroups={activeGroups}
					/>

					{/* Close fullscreen button */}
					<Tooltip title="Cerrar pantalla completa" placement="left" arrow>
						<IconButton
							size="small"
							onClick={() => { setExpanded(false); setDetailNode(null); }}
							sx={{
								position: "absolute",
								top: 12,
								right: 56,
								zIndex: 10,
								bgcolor: "background.paper",
								boxShadow: 2,
								width: 36,
								height: 36,
								"&:hover": { bgcolor: "error.lighter" },
							}}
						>
							<Iconify icon="mdi:fullscreen-exit" width={22} />
						</IconButton>
					</Tooltip>

					{/* Node detail panel (slides in from left) */}
					{detailNode && (
						<Box
							sx={{
								position: "absolute",
								top: 16,
								left: 16,
								zIndex: 20,
								transition: "transform 0.2s ease",
							}}
						>
							<NodeDetailPanel node={detailNode} onClose={() => setDetailNode(null)} />
						</Box>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
