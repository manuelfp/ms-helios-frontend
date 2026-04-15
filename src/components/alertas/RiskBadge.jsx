import Chip from "@mui/material/Chip";

const LEVEL = {
	bajo: { label: "Riesgo bajo", color: "success" },
	medio: { label: "Riesgo medio", color: "warning" },
	alto: { label: "Riesgo alto", color: "error" },
	critico: { label: "Riesgo crítico", color: "error" },
};

/**
 * @param {{ nivel?: string; score?: number; size?: "small"|"medium" }} props
 */
export function RiskBadge({ nivel = "medio", score, size = "small" }) {
	const key = String(nivel || "medio").toLowerCase();
	const cfg = LEVEL[key] || LEVEL.medio;
	return (
		<Chip
			size={size}
			color={cfg.color}
			variant={key === "critico" ? "filled" : "outlined"}
			label={
				score != null ? `${cfg.label} · ${score}` : cfg.label
			}
		/>
	);
}
