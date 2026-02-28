import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { Iconify } from "@/components/core";

const MOCK_CONTRATOS = [
	{
		id: "CTR-2026-001",
		objeto: "Suministro de equipos de comunicación",
		entidad: "Ejército Nacional",
		valor: "$2,450,000,000",
		estado: "En ejecución",
		riesgo: "bajo",
	},
	{
		id: "CTR-2026-002",
		objeto: "Mantenimiento de aeronaves",
		entidad: "Fuerza Aérea",
		valor: "$8,120,000,000",
		estado: "Adjudicado",
		riesgo: "medio",
	},
	{
		id: "CTR-2026-003",
		objeto: "Servicios de alimentación tropa",
		entidad: "Armada Nacional",
		valor: "$1,800,000,000",
		estado: "En evaluación",
		riesgo: "alto",
	},
	{
		id: "CTR-2026-004",
		objeto: "Adquisición de vehículos blindados",
		entidad: "Ejército Nacional",
		valor: "$15,300,000,000",
		estado: "En ejecución",
		riesgo: "medio",
	},
	{
		id: "CTR-2026-005",
		objeto: "Dotación de uniformes",
		entidad: "Policía Nacional",
		valor: "$920,000,000",
		estado: "Finalizado",
		riesgo: "bajo",
	},
];

const RISK_CONFIG = {
	bajo: { color: "success", label: "Bajo" },
	medio: { color: "warning", label: "Medio" },
	alto: { color: "error", label: "Alto" },
};

export default function ContratosPage() {
	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Contratos</Typography>
				<Typography variant="body2" color="text.secondary">
					Listado de contratos del Ministerio de Defensa en seguimiento
				</Typography>
			</Stack>

			<Card>
				<CardContent sx={{ p: 0 }}>
					<TableContainer>
						<Table>
							<TableHead>
								<TableRow>
									<TableCell>ID</TableCell>
									<TableCell>Objeto</TableCell>
									<TableCell>Entidad</TableCell>
									<TableCell align="right">Valor</TableCell>
									<TableCell>Estado</TableCell>
									<TableCell>Riesgo IA</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{MOCK_CONTRATOS.map((row) => (
									<TableRow key={row.id} hover sx={{ cursor: "pointer" }}>
										<TableCell>
											<Typography variant="subtitle2">{row.id}</Typography>
										</TableCell>
										<TableCell>{row.objeto}</TableCell>
										<TableCell>{row.entidad}</TableCell>
										<TableCell align="right">
											<Typography variant="body2" fontWeight={500}>
												{row.valor}
											</Typography>
										</TableCell>
										<TableCell>
											<Chip label={row.estado} size="small" variant="outlined" />
										</TableCell>
										<TableCell>
											<Chip
												label={RISK_CONFIG[row.riesgo].label}
												size="small"
												color={RISK_CONFIG[row.riesgo].color}
											/>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</TableContainer>
				</CardContent>
			</Card>

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
				<Iconify icon="solar:info-circle-bold-duotone" width={24} sx={{ color: "info.main" }} />
				<Typography variant="body2" color="info.dark">
					Los datos mostrados son de demostración. La integración con la API de contratos del SECOP se realizará próximamente.
				</Typography>
			</Box>
		</Stack>
	);
}
