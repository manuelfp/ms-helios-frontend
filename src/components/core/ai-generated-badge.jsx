import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";

import { Iconify } from "./iconify";

/**
 * @param {{ variant?: "sql" | "analysis"; compact?: boolean }} props
 */
export function AIGeneratedBadge({ variant = "sql", compact = false }) {
	const isAnalysis = variant === "analysis";
	const label = isAnalysis ? "Estimado por IA" : "SQL vía IA";
	const color = isAnalysis ? "warning" : "info";
	const tip = isAnalysis
		? "Cifra o texto derivado por el modelo a partir de varios resultados; puede variar entre ejecuciones."
		: "La consulta SQL fue generada por IA; los resultados numéricos son determinísticos una vez ejecutada.";

	if (compact) {
		return (
			<Tooltip title={tip}>
				<Chip size="small" color={color} variant="outlined" label="IA" sx={{ height: 22, "& .MuiChip-label": { px: 0.75 } }} />
			</Tooltip>
		);
	}

	return (
		<Tooltip title={tip}>
			<Chip
				size="small"
				color={color}
				variant="filled"
				icon={<Iconify icon="solar:magic-stick-3-bold-duotone" width={16} />}
				label={label}
			/>
		</Tooltip>
	);
}
