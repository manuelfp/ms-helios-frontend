import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Iconify } from "@/components/core";
import { RouterLink } from "@/components/core/link";
import { paths } from "@/paths";

export function CTASection() {
	return (
		<Box
			sx={{
				py: { xs: 8, md: 12 },
				background: "linear-gradient(135deg, #2E3B4E 0%, #222D3E 100%)",
				color: "white",
			}}
		>
			<Container maxWidth="md">
				<Stack spacing={4} alignItems="center" textAlign="center">
					<Typography
						variant="h3"
						fontWeight={800}
						sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}
					>
						Tu vigilancia hace la diferencia
					</Typography>

					<Typography
						variant="body1"
						sx={{ color: "rgba(255,255,255,0.7)", maxWidth: 500, lineHeight: 1.7 }}
					>
						Regístrate como veedor ciudadano y accede a la información detallada de los procesos de
						contratación. Juntos, erradicamos la corrupción.
					</Typography>

					<Button
						component={RouterLink}
						href={paths.auth.register}
						variant="contained"
						size="large"
						sx={{
							bgcolor: "#F2A900",
							color: "#2E3B4E",
							fontWeight: 700,
							px: 5,
							py: 1.5,
							"&:hover": { bgcolor: "#D99600" },
						}}
						startIcon={<Iconify icon="solar:shield-check-bold-duotone" />}
					>
						Crear Cuenta de Veedor
					</Button>
				</Stack>
			</Container>
		</Box>
	);
}
