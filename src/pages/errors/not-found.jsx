import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Iconify } from "@/components/core";
import { RouterLink } from "@/components/core/link";
import { paths } from "@/paths";

export default function NotFoundPage() {
	return (
		<Container>
			<Stack
				spacing={3}
				alignItems="center"
				justifyContent="center"
				textAlign="center"
				sx={{ minHeight: "100vh", py: 8 }}
			>
				<Box
					sx={{
						width: 100,
						height: 100,
						borderRadius: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						bgcolor: "warning.lighter",
					}}
				>
					<Iconify icon="solar:ghost-bold-duotone" width={56} sx={{ color: "warning.main" }} />
				</Box>

				<Stack spacing={1}>
					<Typography variant="h3">Página no encontrada</Typography>
					<Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
						La página que buscas no existe o ha sido movida. Verifica la URL o regresa al inicio.
					</Typography>
				</Stack>

				<Button
					component={RouterLink}
					href={paths.landing}
					variant="contained"
					size="large"
					startIcon={<Iconify icon="solar:home-2-bold-duotone" />}
				>
					Volver al inicio
				</Button>
			</Stack>
		</Container>
	);
}
