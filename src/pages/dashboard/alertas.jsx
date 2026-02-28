import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Iconify } from "@/components/core";

const MOCK_ALERTAS = [
	{
		id: 1,
		titulo: "Posible sobrecosto detectado",
		descripcion:
			"El contrato CTR-2026-003 presenta un valor un 45% superior al promedio histórico para contratos similares de servicios de alimentación.",
		tipo: "Sobrecosto",
		severidad: "alta",
		fecha: "2026-02-27",
		contrato: "CTR-2026-003",
	},
	{
		id: 2,
		titulo: "Pliego con especificaciones restrictivas",
		descripcion:
			"El pliego del contrato CTR-2026-002 incluye requisitos técnicos que limitan la participación a un único proveedor.",
		tipo: "Pliego dirigido",
		severidad: "alta",
		fecha: "2026-02-26",
		contrato: "CTR-2026-002",
	},
	{
		id: 3,
		titulo: "Proveedor con antecedentes",
		descripcion:
			"El proveedor adjudicatario del contrato CTR-2026-004 tiene 3 investigaciones previas en la Contraloría General.",
		tipo: "Proveedor riesgoso",
		severidad: "media",
		fecha: "2026-02-25",
		contrato: "CTR-2026-004",
	},
	{
		id: 4,
		titulo: "Contrato sin pluralidad de oferentes",
		descripcion:
			"Solo se presentó un oferente al proceso de selección del contrato CTR-2026-001, lo cual reduce la competitividad.",
		tipo: "Competencia limitada",
		severidad: "media",
		fecha: "2026-02-24",
		contrato: "CTR-2026-001",
	},
];

const SEVERITY_CONFIG = {
	alta: { color: "error", icon: "solar:danger-bold" },
	media: { color: "warning", icon: "solar:shield-warning-bold" },
	baja: { color: "info", icon: "solar:info-circle-bold" },
};

export default function AlertasPage() {
	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Alertas de IA</Typography>
				<Typography variant="body2" color="text.secondary">
					Anomalías detectadas por los modelos de Inteligencia Artificial en procesos de contratación
				</Typography>
			</Stack>

			<Stack spacing={2}>
				{MOCK_ALERTAS.map((alerta) => {
					const config = SEVERITY_CONFIG[alerta.severidad];
					return (
						<Card
							key={alerta.id}
							sx={{
								borderLeft: 4,
								borderColor: `${config.color}.main`,
								transition: "box-shadow 0.2s",
								"&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
							}}
						>
							<CardContent>
								<Stack spacing={2}>
									<Stack direction="row" alignItems="flex-start" justifyContent="space-between">
										<Stack direction="row" spacing={1.5} alignItems="center">
											<Box
												sx={{
													width: 40,
													height: 40,
													borderRadius: 1.5,
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													bgcolor: `${config.color}.lighter`,
												}}
											>
												<Iconify icon={config.icon} width={22} sx={{ color: `${config.color}.main` }} />
											</Box>
											<Stack spacing={0.25}>
												<Typography variant="subtitle1">{alerta.titulo}</Typography>
												<Stack direction="row" spacing={1}>
													<Chip label={alerta.tipo} size="small" variant="outlined" />
													<Chip
														label={`Severidad: ${alerta.severidad}`}
														size="small"
														color={config.color}
													/>
												</Stack>
											</Stack>
										</Stack>
										<Typography variant="caption" color="text.disabled">
											{alerta.fecha}
										</Typography>
									</Stack>

									<Typography variant="body2" color="text.secondary">
										{alerta.descripcion}
									</Typography>

									<Typography variant="caption" color="text.disabled">
										Contrato relacionado: <strong>{alerta.contrato}</strong>
									</Typography>
								</Stack>
							</CardContent>
						</Card>
					);
				})}
			</Stack>

			<Box
				sx={{
					p: 3,
					borderRadius: 2,
					bgcolor: "info.lighter",
					border: "1px dashed",
					borderColor: "info.main",
					display: "flex",
					alignItems: "center",
					gap: 2,
				}}
			>
				<Iconify icon="solar:cpu-bolt-bold-duotone" width={24} sx={{ color: "info.main" }} />
				<Typography variant="body2" color="info.dark">
					Las alertas son generadas por modelos de IA en fase de desarrollo. Los datos mostrados son de
					demostración.
				</Typography>
			</Box>
		</Stack>
	);
}
