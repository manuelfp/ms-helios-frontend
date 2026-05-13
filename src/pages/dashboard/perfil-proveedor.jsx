import { useEffect, useState } from "react";

import { Link as RouterLink, useParams } from "react-router-dom";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { RiskBadge } from "@/components/alertas/RiskBadge";
import { GraphViewer } from "@/components/core/graph-viewer";
import { DataSourceBadge, Iconify } from "@/components/core";
import { ReconciliationPanel } from "@/components/core/reconciliation-panel";
import { getProviderAlertProfile, getReconciliation } from "@/services/helios-api";
import { paths } from "@/paths";
import { fCurrency, fNumber } from "@/utils/format";

export default function PerfilProveedorPage() {
	const { documento } = useParams();
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [reconLoading, setReconLoading] = useState(false);
	const [recon, setRecon] = useState(null);
	const [reconError, setReconError] = useState(null);

	useEffect(() => {
		if (!documento) return;
		let cancelled = false;
		setLoading(true);
		setError(null);
		getProviderAlertProfile(documento, {})
			.then((d) => {
				if (!cancelled) setData(d);
			})
			.catch((e) => {
				if (!cancelled) setError(e?.message || "Error al cargar perfil");
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [documento]);

	useEffect(() => {
		const doc = data?.documento || documento;
		if (!doc) return;
		let cancelled = false;
		setReconLoading(true);
		setReconError(null);
		getReconciliation(doc)
			.then((r) => {
				if (!cancelled) setRecon(r);
			})
			.catch((e) => {
				if (!cancelled) setReconError(e?.message || "No se pudo cargar la conciliación");
			})
			.finally(() => {
				if (!cancelled) setReconLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [data?.documento, documento]);

	const alertas = data?.alertas_por_tipo || {};
	const entries = Object.entries(alertas);

	return (
		<Stack spacing={3}>
			<Button component={RouterLink} to={paths.dashboard.alertas} size="small" variant="text" startIcon={<Iconify icon="solar:arrow-left-bold-duotone" width={18} />}>
				Volver a alertas
			</Button>

			{error && <Alert severity="error">{error}</Alert>}

			{loading && <Typography>Cargando perfil…</Typography>}

			{!loading && data && (
				<>
					<Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "flex-start" }} justifyContent="space-between">
						<Box>
							<Typography variant="h4" gutterBottom>
								{data.proveedor_adjudicado || "Proveedor"}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Documento / NIT: <strong>{data.documento}</strong>
							</Typography>
						</Box>
						<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
							<DataSourceBadge meta={data._meta} />
							<RiskBadge nivel={data.nivel_riesgo} score={data.score} size="medium" />
							{data.mock && <Chip size="small" label="Datos demo" color="info" variant="outlined" />}
						</Stack>
					</Stack>

					<Grid container spacing={2}>
						<Grid size={{ xs: 12, md: 6 }}>
							<Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
								<CardContent>
									<Typography variant="subtitle1" fontWeight={700} gutterBottom>
										Alertas por tipo
									</Typography>
									<Stack spacing={1} flexWrap="wrap" direction="row" useFlexGap>
										{entries.length === 0 && (
											<Typography variant="body2" color="text.secondary">
												Sin alertas registradas en el resumen.
											</Typography>
										)}
										{entries.map(([tipo, n]) => (
											<Chip key={tipo} label={`${tipo}: ${fNumber(n)}`} variant="outlined" />
										))}
									</Stack>
								</CardContent>
							</Card>
						</Grid>
						<Grid size={{ xs: 12, md: 6 }}>
							<Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
								<CardContent>
									<Typography variant="subtitle1" fontWeight={700} gutterBottom>
										Acciones
									</Typography>
									<Stack spacing={1}>
										<Button
											component={RouterLink}
											to={`${paths.dashboard.investigacion}?doc=${encodeURIComponent(String(data.documento || "").trim())}`}
											variant="outlined"
											size="small"
											startIcon={<Iconify icon="solar:magnifer-bold-duotone" width={18} />}
										>
											Ir a Investigación
										</Button>
										<Button component={RouterLink} to={paths.dashboard.contratos} variant="text" size="small">
											Buscar contratos relacionados
										</Button>
									</Stack>
								</CardContent>
							</Card>
						</Grid>
					</Grid>

					<ReconciliationPanel data={recon} loading={reconLoading} error={reconError} />

					{data.contratos_recientes?.length > 0 && (
						<Card variant="outlined" sx={{ borderRadius: 2 }}>
							<CardContent>
								<Typography variant="subtitle1" fontWeight={700} gutterBottom>
									Contratos recientes (muestra)
								</Typography>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell>Entidad</TableCell>
											<TableCell align="right">Valor</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{data.contratos_recientes.map((c, i) => (
											<TableRow key={i}>
												<TableCell>{c.id_contrato}</TableCell>
												<TableCell>{c.nombre_entidad}</TableCell>
												<TableCell align="right">{fCurrency(c.valor_del_contrato)}</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					)}

					{data.graph?.nodes?.length > 0 && (
						<Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
							<Typography variant="subtitle1" fontWeight={700} gutterBottom>
								Red de relaciones (demostración)
							</Typography>
							<GraphViewer data={data.graph} height={420} />
						</Card>
					)}
				</>
			)}
		</Stack>
	);
}
