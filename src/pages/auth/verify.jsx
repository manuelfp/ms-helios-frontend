import { useState } from "react";

import { useSearchParams } from "react-router-dom";

import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { Iconify } from "@/components/core";
import { RouterLink } from "@/components/core/link";
import { paths } from "@/paths";

export default function VerifyPage() {
	const [searchParams] = useSearchParams();
	const email = searchParams.get("email") || "";
	const { resendVerification } = useAuthContext();
	const [loading, setLoading] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState("");

	const handleResend = async () => {
		try {
			setLoading(true);
			setError("");
			await resendVerification();
			setSent(true);
		} catch (err) {
			setError(err?.message || "No se pudo reenviar el correo.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Stack spacing={3} alignItems="center" textAlign="center" sx={{ py: 4 }}>
			<Box
				sx={{
					width: 80,
					height: 80,
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					bgcolor: "primary.lighter",
				}}
			>
				<Iconify icon="solar:mailbox-bold-duotone" width={40} sx={{ color: "primary.main" }} />
			</Box>

			<Stack spacing={1}>
				<Typography variant="h4">Revisa tu correo</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
					Hemos enviado un enlace de verificación a{" "}
					<strong>{email || "tu correo electrónico"}</strong>. Revisa tu bandeja de entrada y la
					carpeta de spam.
				</Typography>
			</Stack>

			{error && <Alert severity="error">{error}</Alert>}
			{sent && <Alert severity="success">Correo reenviado con éxito.</Alert>}

			<LoadingButton
				variant="outlined"
				loading={loading}
				onClick={handleResend}
				startIcon={<Iconify icon="solar:refresh-bold" />}
			>
				Reenviar correo de verificación
			</LoadingButton>

			<Link component={RouterLink} href={paths.auth.login} variant="body2" color="primary">
				Volver al inicio de sesión
			</Link>
		</Stack>
	);
}
