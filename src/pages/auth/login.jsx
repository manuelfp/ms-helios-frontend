import { useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as Yup from "yup";

import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { Iconify } from "@/components/core";
import { RouterLink } from "@/components/core/link";
import { FormProvider, RHFTextField } from "@/components/hook-form";
import { paths } from "@/paths";
import { useRouter } from "@/routes/hooks/use-router";
import { PATH_AFTER_LOGIN } from "@/config-global";

const LoginSchema = Yup.object().shape({
	email: Yup.string().required("El correo es obligatorio").email("Ingresa un correo válido"),
	password: Yup.string().required("La contraseña es obligatoria"),
});

const defaultValues = {
	email: "",
	password: "",
};

export default function LoginPage() {
	const { login } = useAuthContext();
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	const methods = useForm({
		resolver: yupResolver(LoginSchema),
		defaultValues,
	});

	const {
		handleSubmit,
		formState: { isSubmitting },
	} = methods;

	const onSubmit = handleSubmit(async (data) => {
		try {
			setErrorMsg("");
			await login(data.email, data.password);
			router.push(PATH_AFTER_LOGIN);
		} catch (error) {
			const msg =
				error?.code === "auth/invalid-credential"
					? "Correo o contraseña incorrectos."
					: error?.code === "auth/too-many-requests"
						? "Demasiados intentos. Intenta de nuevo más tarde."
						: error?.message || "Error al iniciar sesión.";
			setErrorMsg(msg);
		}
	});

	return (
		<Stack spacing={3}>
			<Stack spacing={1}>
				<Typography variant="h4">Iniciar sesión</Typography>
				<Typography variant="body2" color="text.secondary">
					¿No tienes cuenta?{" "}
					<Link component={RouterLink} href={paths.auth.register} variant="subtitle2" color="primary">
						Regístrate aquí
					</Link>
				</Typography>
			</Stack>

			{errorMsg && (
				<Alert severity="error" onClose={() => setErrorMsg("")}>
					{errorMsg}
				</Alert>
			)}

			<FormProvider methods={methods} onSubmit={onSubmit}>
				<Stack spacing={2.5}>
					<RHFTextField name="email" label="Correo electrónico" autoComplete="email" />

					<RHFTextField
						name="password"
						label="Contraseña"
						type={showPassword ? "text" : "password"}
						autoComplete="current-password"
						slotProps={{
							input: {
								endAdornment: (
									<InputAdornment position="end">
										<IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
											<Iconify icon={showPassword ? "solar:eye-bold" : "solar:eye-closed-bold"} />
										</IconButton>
									</InputAdornment>
								),
							},
						}}
					/>

					<Link
						component={RouterLink}
						href={paths.auth.forgotPassword}
						variant="body2"
						color="primary"
						sx={{ alignSelf: "flex-end" }}
					>
						¿Olvidaste tu contraseña?
					</Link>

					<LoadingButton
						fullWidth
						size="large"
						type="submit"
						variant="contained"
						loading={isSubmitting}
					>
						Ingresar
					</LoadingButton>
				</Stack>
			</FormProvider>
		</Stack>
	);
}
