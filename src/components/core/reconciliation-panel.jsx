import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { fNumber } from "@/utils/format";

/**
 * @param {{ data?: { helios?: Record<string, unknown>; datos_gov_co?: Record<string, string> } | null; loading?: boolean; error?: string | null }} props
 */
export function ReconciliationPanel({ data, loading, error }) {
	if (loading) {
		return (
			<Card variant="outlined" sx={{ borderRadius: 2 }}>
				<CardContent>
					<Typography variant="body2" color="text.secondary">
						Cargando conciliación…
					</Typography>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Alert severity="warning" variant="outlined">
				{error}
			</Alert>
		);
	}

	if (!data?.helios) return null;

	const h = data.helios;
	const dg = data.datos_gov_co || {};

	return (
		<Card variant="outlined" sx={{ borderRadius: 2 }}>
			<CardContent>
				<Typography variant="subtitle1" fontWeight={700} gutterBottom>
					Conciliación Helios vs SECOP II (referencia)
				</Typography>
				<Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
					Helios cuenta filas en <code>silver_zone.vw_contratos_electronicos</code> por rol. Compare con datos.gov.co para validación externa.
				</Typography>

				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Rol / fuente</TableCell>
							<TableCell align="right">Total (Helios)</TableCell>
							<TableCell>Detalle</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						<TableRow>
							<TableCell>Como proveedor (documento_proveedor)</TableCell>
							<TableCell align="right">{fNumber(h.as_provider?.total_contratos ?? 0)}</TableCell>
							<TableCell>
								<Typography variant="caption" color="text.secondary">
									{h.as_provider?.table}
								</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Como entidad contratante (nit_entidad)</TableCell>
							<TableCell align="right">{fNumber(h.as_entity?.total_contratos ?? 0)}</TableCell>
							<TableCell>
								<Typography variant="caption" color="text.secondary">
									{h.as_entity?.table}
								</Typography>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Suma de roles (no deduplica id_contrato cruzado)</TableCell>
							<TableCell align="right">{fNumber(h.sum_roles ?? 0)}</TableCell>
							<TableCell />
						</TableRow>
						{h.from_alerts?.total_contratos != null && (
							<TableRow>
								<TableCell>Contratos distintos en alertas (materializado)</TableCell>
								<TableCell align="right">{fNumber(h.from_alerts.total_contratos)}</TableCell>
								<TableCell>
									<Typography variant="caption" color="text.secondary">
										{h.from_alerts.table}
										{h.from_alerts.note ? ` — ${h.from_alerts.note}` : ""}
									</Typography>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>

				<Stack spacing={1} sx={{ mt: 2 }}>
					<Typography variant="caption" fontWeight={600}>
						Fuentes públicas (consulta manual)
					</Typography>
					<Box component="ul" sx={{ m: 0, pl: 2 }}>
						<li>
							<Link href={dg.secop_ii_contratos_url} target="_blank" rel="noopener">
								SECOP II — Contratos electrónicos (datos.gov.co)
							</Link>
						</li>
						<li>
							<Link href={dg.secop_ii_procesos_url} target="_blank" rel="noopener">
								SECOP II — Procesos (datos.gov.co)
							</Link>
						</li>
					</Box>
					{dg.note && (
						<Typography variant="caption" color="text.secondary">
							{dg.note}
						</Typography>
					)}
				</Stack>
			</CardContent>
		</Card>
	);
}
