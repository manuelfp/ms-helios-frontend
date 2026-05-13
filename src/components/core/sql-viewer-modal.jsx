import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

/**
 * @param {{ open: boolean; onClose: () => void; title?: string; sql?: string | null; secondarySql?: string | null }} props
 */
export function SQLViewerModal({ open, onClose, title = "Consulta SQL", sql, secondarySql }) {
	return (
		<Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
			<DialogTitle>{title}</DialogTitle>
			<DialogContent dividers>
				{sql ? (
					<Box
						component="pre"
						sx={{
							m: 0,
							p: 1.5,
							borderRadius: 1,
							bgcolor: "grey.900",
							color: "grey.100",
							fontSize: 12,
							overflow: "auto",
							maxHeight: 360,
							whiteSpace: "pre-wrap",
							wordBreak: "break-word",
							fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
						}}
					>
						{sql}
					</Box>
				) : (
					<Typography variant="body2" color="text.secondary">
						No hay SQL disponible.
					</Typography>
				)}
				{secondarySql ? (
					<Box sx={{ mt: 2 }}>
						<Typography variant="subtitle2" gutterBottom>
							Consulta del grafo
						</Typography>
						<Box
							component="pre"
							sx={{
								m: 0,
								p: 1.5,
								borderRadius: 1,
								bgcolor: "grey.800",
								color: "grey.100",
								fontSize: 12,
								overflow: "auto",
								maxHeight: 240,
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
								fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
							}}
						>
							{secondarySql}
						</Box>
					</Box>
				) : null}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cerrar</Button>
			</DialogActions>
		</Dialog>
	);
}
