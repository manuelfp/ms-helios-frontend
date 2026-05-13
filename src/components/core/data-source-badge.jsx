import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { Iconify } from "./iconify";

/**
 * @param {{ meta?: Record<string, unknown> | null; compact?: boolean }} props
 */
export function DataSourceBadge({ meta, compact = false }) {
	if (!meta || typeof meta !== "object") return null;

	const lines = [];
	if (meta.source) lines.push(`Fuente: ${meta.source}`);
	if (meta.table) lines.push(`Tabla/vista: ${meta.table}`);
	if (meta.last_update) lines.push(`Metadatos BQ (creation_time): ${meta.last_update}`);
	if (meta.generated_by) lines.push(`Tipo: ${meta.generated_by}`);
	if (meta.filters_applied && Object.keys(meta.filters_applied).length) {
		const f = JSON.stringify(meta.filters_applied);
		if (f !== "{}") lines.push(`Filtros: ${f}`);
	}
	if (Array.isArray(meta.notes) && meta.notes.length) {
		meta.notes.forEach((n) => lines.push(String(n)));
	}

	const tooltip = lines.join("\n");
	const short = meta.table ? String(meta.table).split(".").pop() : "datos";

	if (compact) {
		return (
			<Tooltip title={<pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 11 }}>{tooltip}</pre>}>
				<Chip size="small" variant="outlined" color="default" label={short} icon={<Iconify icon="solar:database-bold-duotone" width={16} />} />
			</Tooltip>
		);
	}

	return (
		<Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: "wrap", gap: 0.5 }}>
			<Tooltip title={<pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 11 }}>{tooltip}</pre>}>
				<Chip
					size="small"
					variant="outlined"
					color="primary"
					icon={<Iconify icon="solar:info-circle-bold-duotone" width={16} />}
					label={`Origen: ${short}`}
				/>
			</Tooltip>
			{meta.generated_by === "gemini_sql" && (
				<Typography variant="caption" color="text.secondary">
					SQL generado por IA
				</Typography>
			)}
		</Stack>
	);
}
