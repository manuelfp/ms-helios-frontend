import { useCallback, useEffect, useRef } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import ForceGraph2D from "react-force-graph-2d";

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
};

function getNodeColor(node) {
	const label = node.group || (node.labels && node.labels[0]) || "default";
	return NODE_COLORS[label] || "#919EAB";
}

function getNodeLabel(node) {
	const props = node.properties || {};
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

export function GraphViewer({ data, height = 500, sx, onNodeClick, selectedNodeId }) {
	const fgRef = useRef();

	const graphData = {
		nodes: (data?.nodes || []).map((n) => ({ ...n, color: getNodeColor(n) })),
		links: (data?.links || []).map((l) => ({ ...l })),
	};

	useEffect(() => {
		if (fgRef.current && graphData.nodes.length > 0) {
			setTimeout(() => fgRef.current?.zoomToFit(400, 40), 500);
		}
	}, [graphData.nodes.length]);

	const handleNodeClick = useCallback(
		(node) => {
			if (onNodeClick) onNodeClick(node);
		},
		[onNodeClick],
	);

	const paintNode = useCallback((node, ctx, globalScale) => {
		const label = getNodeLabel(node);
		const fontSize = Math.max(10 / globalScale, 2);
		const isSelected = node.id === selectedNodeId;
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

		if ((globalScale > 0.8 || isSelected) && label) {
			ctx.font = `${isSelected ? "bold " : ""}${fontSize}px Inter, sans-serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.fillStyle = isSelected ? "#2E3B4E" : "#333";
			const shortLabel = label.length > 25 ? label.slice(0, 22) + "..." : label;
			ctx.fillText(shortLabel, node.x, node.y + radius + 2);
		}
	}, [selectedNodeId]);

	if (!graphData.nodes.length) {
		return (
			<Box sx={{ height, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "grey.100", borderRadius: 2, ...sx }}>
				<Typography variant="body2" color="text.disabled">Sin datos de grafo para mostrar</Typography>
			</Box>
		);
	}

	return (
		<Box sx={{ height, borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider", ...sx }}>
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
				onNodeClick={handleNodeClick}
				linkColor={() => "rgba(0,0,0,0.15)"}
				linkWidth={0.8}
				linkDirectionalArrowLength={3}
				linkDirectionalArrowRelPos={1}
				width={undefined}
				height={height}
				cooldownTicks={80}
				onEngineStop={() => fgRef.current?.zoomToFit(400, 40)}
			/>
		</Box>
	);
}
