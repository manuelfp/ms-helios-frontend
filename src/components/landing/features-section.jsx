import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Iconify } from "@/components/core";

const FEATURES = [
	{
		icon: "solar:document-medicine-bold-duotone",
		title: "Auditoría Abierta",
		description:
			"Explora los pliegos y contratos del Ministerio de Defensa de forma sencilla. Accede a información estructurada y comprensible sobre los procesos de contratación.",
		color: "#2E3B4E",
	},
	{
		icon: "solar:shield-warning-bold-duotone",
		title: "Detección de Riesgos",
		description:
			"Conoce las alertas tempranas generadas por nuestros modelos de Inteligencia Artificial sobre contrataciones anómalas y posibles irregularidades.",
		color: "#F2A900",
	},
	{
		icon: "solar:users-group-rounded-bold-duotone",
		title: "Participación Ciudadana",
		description:
			"Tu vigilancia hace la diferencia. Accede a datos estructurados para tus propias investigaciones y contribuye a la transparencia del Estado.",
		color: "#4A6741",
	},
];

export function FeaturesSection() {
	return (
		<Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
			<Container maxWidth="lg">
				<Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 6, md: 8 } }}>
					<Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 700 }}>
						Cómo funciona
					</Typography>
					<Typography variant="h2" sx={{ maxWidth: 600, fontSize: { xs: "1.75rem", md: "2.25rem" } }}>
						Herramientas al servicio de la transparencia
					</Typography>
					<Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
						Helios combina datos abiertos e inteligencia artificial para empoderar la veeduría ciudadana.
					</Typography>
				</Stack>

				<Grid container spacing={4}>
					{FEATURES.map((feature) => (
						<Grid size={{ xs: 12, md: 4 }} key={feature.title}>
							<Card
								sx={{
									height: "100%",
									textAlign: "center",
									transition: "transform 0.2s, box-shadow 0.2s",
									"&:hover": {
										transform: "translateY(-4px)",
										boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
									},
								}}
							>
								<CardContent sx={{ p: 4 }}>
									<Box
										sx={{
											width: 64,
											height: 64,
											borderRadius: 2,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											bgcolor: `${feature.color}14`,
											mx: "auto",
											mb: 3,
										}}
									>
										<Iconify icon={feature.icon} width={32} sx={{ color: feature.color }} />
									</Box>

									<Typography variant="h5" sx={{ mb: 2 }}>
										{feature.title}
									</Typography>

									<Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
										{feature.description}
									</Typography>
								</CardContent>
							</Card>
						</Grid>
					))}
				</Grid>
			</Container>
		</Box>
	);
}
