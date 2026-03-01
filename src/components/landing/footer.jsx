import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Logo } from "@/components/core";

export function Footer() {
	return (
		<Box component="footer" sx={{ bgcolor: "#171F2C", color: "rgba(255,255,255,0.6)", py: 4 }}>
			<Container maxWidth="lg">
				<Stack
					direction={{ xs: "column", md: "row" }}
					justifyContent="space-between"
					alignItems="center"
					spacing={3}
				>
					<Stack direction="row" alignItems="center" spacing={3}>
						<Logo sx={{ height: 32 }} />
						<Divider orientation="vertical" flexItem sx={{ borderColor: "rgba(255,255,255,0.15)" }} />
						<Box
							component="img"
							src="/logo-mindefensa.png"
							alt="Ministerio de Defensa"
							sx={{ height: 36, width: "auto", objectFit: "contain", opacity: 0.6 }}
						/>
					</Stack>

					<Stack direction="row" spacing={3}>
						<Typography variant="caption">Términos y condiciones</Typography>
						<Typography variant="caption">Política de privacidad</Typography>
						<Typography variant="caption">Ley 1581 de 2012</Typography>
					</Stack>
				</Stack>

				<Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.1)" }} />

				<Stack
					direction={{ xs: "column", sm: "row" }}
					justifyContent="space-between"
					alignItems="center"
					spacing={1}
				>
					<Typography variant="caption">
						&copy; {new Date().getFullYear()} Helios &mdash; Sistema de Información &mdash; Ministerio de Defensa de Colombia
					</Typography>
					<Typography variant="caption">
						Desarrollado por la Dirección de Ingeniería
					</Typography>
				</Stack>
			</Container>
		</Box>
	);
}
