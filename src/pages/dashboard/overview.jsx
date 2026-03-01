import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { Iconify } from "@/components/core";
import { StatCard } from "@/components/dashboard";

const STATS = [
	{
		title: "Contratos en seguimiento",
		value: 1247,
		icon: "solar:document-bold-duotone",
		color: "#2E3B4E",
		bgcolor: "rgba(46, 59, 78, 0.08)",
	},
	{
		title: "Alertas activas",
		value: 23,
		icon: "solar:danger-triangle-bold-duotone",
		color: "#F2A900",
		bgcolor: "rgba(242, 169, 0, 0.08)",
	},
	{
		title: "Análisis de IA completados",
		value: 856,
		icon: "solar:cpu-bolt-bold-duotone",
		color: "#4A6741",
		bgcolor: "rgba(74, 103, 65, 0.08)",
	},
	{
		title: "Veedores registrados",
		value: 3412,
		icon: "solar:users-group-rounded-bold-duotone",
		color: "#1976D2",
		bgcolor: "rgba(25, 118, 210, 0.08)",
	},
];

export default function OverviewPage() {
	const { user } = useAuthContext();

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">
					Bienvenido{user?.displayName ? `, ${user.displayName}` : ""}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Panel de veeduría ciudadana &mdash; Proyecto Helios
				</Typography>
			</Stack>

			<Grid container spacing={3}>
				{STATS.map((stat) => (
					<Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
						<StatCard stat={stat} />
					</Grid>
				))}
			</Grid>

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 8 }}>
					<Card sx={{ height: 360 }}>
						<CardContent>
							<Typography variant="h6" sx={{ mb: 2 }}>
								Contratos por entidad
							</Typography>
							<Box
								sx={{
									height: 280,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									bgcolor: "grey.100",
									borderRadius: 2,
								}}
							>
								<Stack alignItems="center" spacing={1}>
									<Iconify icon="solar:chart-2-bold-duotone" width={48} sx={{ color: "grey.400" }} />
									<Typography variant="body2" color="text.disabled">
										Gráfico de contratos (próximamente)
									</Typography>
								</Stack>
							</Box>
						</CardContent>
					</Card>
				</Grid>

				<Grid size={{ xs: 12, md: 4 }}>
					<Card sx={{ height: 360 }}>
						<CardContent>
							<Typography variant="h6" sx={{ mb: 2 }}>
								Últimas alertas
							</Typography>
							<Stack spacing={2}>
								{[
									{ text: "Posible sobrecosto en contrato #4521", severity: "error" },
									{ text: "Pliego con especificaciones restrictivas", severity: "warning" },
									{ text: "Contrato adjudicado sin pluralidad de oferentes", severity: "warning" },
								].map((alert, index) => (
									<Box
										key={index}
										sx={{
											p: 2,
											borderRadius: 1.5,
											bgcolor: alert.severity === "error" ? "error.lighter" : "warning.lighter",
											borderLeft: 3,
											borderColor: `${alert.severity}.main`,
										}}
									>
										<Typography variant="body2">{alert.text}</Typography>
									</Box>
								))}
							</Stack>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Stack>
	);
}
