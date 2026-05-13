import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Iconify, MarkdownView } from "@/components/core";
import { paths } from "@/paths";
import { useRouter } from "@/routes/hooks/use-router";

import metodologiaMarkdown from "@/content/metodologia-conteos.md?raw";

export default function MetodologiaPage() {
	const router = useRouter();

	return (
		<Stack spacing={3}>
			<Stack
				direction={{ xs: "column", sm: "row" }}
				spacing={2}
				alignItems={{ sm: "center" }}
				justifyContent="space-between"
			>
				<Stack spacing={0.5}>
					<Typography variant="h4">Metodología de conteos</Typography>
					<Typography variant="body2" color="text.secondary">
						Cómo interpreta Helios las cifras frente a fuentes públicas (SECOP II / datos.gov.co).
					</Typography>
				</Stack>
				<Button
					variant="outlined"
					size="small"
					startIcon={<Iconify icon="solar:arrow-left-bold-duotone" />}
					onClick={() => router.back()}
				>
					Volver
				</Button>
			</Stack>

			<Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
				Esta página documenta las reglas de conteo que aplica cada módulo. Los totales pueden diferir de conteos únicos publicados en datos.gov.co porque Helios cuenta filas de las vistas SQL indicadas en cada pantalla.
			</Alert>

			<Card>
				<CardContent sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
					<MarkdownView markdown={metodologiaMarkdown} />
				</CardContent>
			</Card>

			<Stack
				direction="row"
				spacing={1}
				alignItems="center"
				justifyContent="space-between"
				sx={{ pt: 1 }}
			>
				<Typography variant="caption" color="text.secondary">
					¿Tienes dudas sobre un total específico? Consulta también el glosario en
					<strong> Acerca de los datos</strong> (barra superior) o revisa el chip de procedencia en cada vista.
				</Typography>
				<Button
					variant="text"
					size="small"
					onClick={() => router.push(paths.dashboard.root)}
				>
					Ir al Dashboard
				</Button>
			</Stack>
		</Stack>
	);
}
