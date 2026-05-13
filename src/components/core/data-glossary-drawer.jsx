import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Iconify } from "./iconify";

/** @param {string} md */
function simplifyMarkdown(md) {
	return String(md || "")
		.replace(/\r\n/g, "\n")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/\*\*(.+?)\*\*/g, "$1")
		.replace(/`([^`]+)`/g, "$1");
}

/**
 * @param {{ open: boolean; onClose: () => void; markdown: string }} props
 */
export function DataGlossaryDrawer({ open, onClose, markdown }) {
	const text = simplifyMarkdown(markdown);
	return (
		<Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: 440 }, p: 0 } }}>
			<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider" }}>
				<Typography variant="h6">Acerca de los datos</Typography>
				<IconButton onClick={onClose} aria-label="Cerrar">
					<Iconify icon="solar:close-circle-bold-duotone" width={22} />
				</IconButton>
			</Stack>
			<Stack sx={{ p: 2, overflow: "auto" }}>
				<Typography
					component="div"
					variant="body2"
					color="text.secondary"
					sx={{ whiteSpace: "pre-wrap", fontFamily: "inherit", "& code": { fontSize: "0.85em", bgcolor: "grey.100", px: 0.5, borderRadius: 0.5 } }}
				>
					{text}
				</Typography>
			</Stack>
		</Drawer>
	);
}
