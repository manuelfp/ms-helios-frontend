import { useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { Iconify } from "@/components/core";
import { RouterLink } from "@/components/core/link";
import { FormProvider, RHFTextField } from "@/components/hook-form";
import { paths } from "@/paths";

const ForgotSchema = Yup.object().shape({
	email: Yup.string().required("El correo es obligatorio").email("Ingresa un correo válido"),
});

export default function ForgotPasswordPage() {
	const { forgotPassword } = useAuthContext();
	const [success, setSuccess] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const methods = useForm({
		resolver: yupResolver(ForgotSchema),
		defaultValues: { email: "" },
	});

	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const onSubmit = handleSubmit(async (data) => {
		try {
			setErrorMsg("");
			await forgotPassword(data.email);
			setSuccess(true);
		} catch (error) {
			setErrorMsg(error?.message || "No se pudo enviar el correo de recuperación.");
		}
	});

	return (
		<Stack spacing={3} sx={{ py: 4 }}>
			<Stack spacing={1} alignItems="center" textAlign="center">
				<Box
					sx={{
						width: 80,
						height: 80,
						borderRadius: "50%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						bgcolor: "warning.lighter",
						mb: 1,
					}}
				>
					<Iconify icon="solar:lock-keyhole-bold-duotone" width={40} sx={{ color: "warning.main" }} />
				</Box>

				<Typography variant="h4">¿Olvidaste tu contraseña?</Typography>
				<Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
					Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
				</Typography>
			</Stack>

			{errorMsg && (
				<Alert severity="error" onClose={() => setErrorMsg("")}>
					{errorMsg}
				</Alert>
			)}

			{success ? (
				<Stack spacing={2} alignItems="center">
					<Alert severity="success" sx={{ width: "100%" }}>
						Se ha enviado un correo con las instrucciones para restablecer tu contraseña.
					</Alert>
					<Link component={RouterLink} href={paths.auth.login} variant="subtitle2" color="primary">
						Volver al inicio de sesión
					</Link>
				</Stack>
			) : (
				<FormProvider methods={methods} onSubmit={onSubmit}>
					<Stack spacing={2.5}>
						<RHFTextField name="email" label="Correo electrónico" autoComplete="email" />

						<LoadingButton
							fullWidth
							size="large"
							type="submit"
							variant="contained"
							loading={isSubmitting}
						>
							Enviar instrucciones
						</LoadingButton>

						<Link
							component={RouterLink}
							href={paths.auth.login}
							variant="body2"
							color="primary"
							sx={{ alignSelf: "center" }}
						>
							Volver al inicio de sesión
						</Link>
					</Stack>
				</FormProvider>
			)}
		</Stack>
	);
}
