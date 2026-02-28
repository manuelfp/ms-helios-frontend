import { useState } from "react";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, useWatch } from "react-hook-form";
import * as Yup from "yup";

import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useAuthContext } from "@/auth/hooks/use-auth-context";
import { Iconify } from "@/components/core";
import { RouterLink } from "@/components/core/link";
import { FormProvider, RHFCheckbox, RHFSelect, RHFTextField } from "@/components/hook-form";
import { paths } from "@/paths";
import { useRouter } from "@/routes/hooks/use-router";

const DOCUMENT_TYPES = [
	{ value: "CC", label: "Cédula de Ciudadanía" },
	{ value: "CE", label: "Cédula de Extranjería" },
	{ value: "NIT", label: "NIT" },
];

const RegisterSchema = Yup.object().shape({
	firstName: Yup.string().required("Los nombres son obligatorios").min(2, "Mínimo 2 caracteres"),
	lastName: Yup.string().required("Los apellidos son obligatorios").min(2, "Mínimo 2 caracteres"),
	documentType: Yup.string().required("Selecciona un tipo de documento"),
	documentNumber: Yup.string()
		.required("El número de documento es obligatorio")
		.matches(/^[0-9]+$/, "Solo se permiten números")
		.min(5, "Mínimo 5 dígitos"),
	email: Yup.string().required("El correo es obligatorio").email("Ingresa un correo válido"),
	password: Yup.string()
		.required("La contraseña es obligatoria")
		.min(8, "Mínimo 8 caracteres")
		.matches(/[A-Z]/, "Debe contener al menos una mayúscula")
		.matches(/[0-9]/, "Debe contener al menos un número")
		.matches(/[^A-Za-z0-9]/, "Debe contener al menos un símbolo"),
	confirmPassword: Yup.string()
		.required("Confirma tu contraseña")
		.oneOf([Yup.ref("password")], "Las contraseñas no coinciden"),
	acceptTerms: Yup.boolean().oneOf([true], "Debes aceptar los términos y condiciones"),
});

const defaultValues = {
	firstName: "",
	lastName: "",
	documentType: "",
	documentNumber: "",
	email: "",
	password: "",
	confirmPassword: "",
	acceptTerms: false,
};

function getPasswordStrength(password) {
	if (!password) return { score: 0, label: "", color: "grey" };

	let score = 0;
	if (password.length >= 8) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;

	const levels = [
		{ label: "Muy débil", color: "error" },
		{ label: "Débil", color: "error" },
		{ label: "Aceptable", color: "warning" },
		{ label: "Fuerte", color: "info" },
		{ label: "Muy fuerte", color: "success" },
	];

	return { score, ...levels[score] };
}

export default function RegisterPage() {
	const { register: authRegister } = useAuthContext();
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [registeredEmail, setRegisteredEmail] = useState("");

	const methods = useForm({
		resolver: yupResolver(RegisterSchema),
		defaultValues,
	});

	const {
		handleSubmit,
		control,
		formState: { isSubmitting },
	} = methods;

	const passwordValue = useWatch({ control, name: "password" });
	const strength = getPasswordStrength(passwordValue);

	const onSubmit = handleSubmit(async (data) => {
		try {
			setErrorMsg("");
			const displayName = `${data.firstName} ${data.lastName}`;
			await authRegister(data.email, data.password, displayName);
			setRegisteredEmail(data.email);
			setDialogOpen(true);
		} catch (error) {
			const msg =
				error?.code === "auth/email-already-in-use"
					? "Este correo ya está registrado."
					: error?.code === "auth/weak-password"
						? "La contraseña es demasiado débil."
						: error?.message || "Error al crear la cuenta.";
			setErrorMsg(msg);
		}
	});

	const handleDialogClose = () => {
		setDialogOpen(false);
		router.push(`${paths.auth.verify}?email=${encodeURIComponent(registeredEmail)}`);
	};

	return (
		<>
			<Stack spacing={3}>
				<Stack spacing={1}>
					<Typography variant="h4">Crear cuenta de veedor</Typography>
					<Typography variant="body2" color="text.secondary">
						¿Ya tienes cuenta?{" "}
						<Link component={RouterLink} href={paths.auth.login} variant="subtitle2" color="primary">
							Inicia sesión
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
						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<RHFTextField name="firstName" label="Nombres" />
							<RHFTextField name="lastName" label="Apellidos" />
						</Stack>

						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<RHFSelect
								name="documentType"
								label="Tipo de documento"
								options={DOCUMENT_TYPES}
							/>
							<RHFTextField name="documentNumber" label="Número de documento" />
						</Stack>

						<RHFTextField name="email" label="Correo electrónico" autoComplete="email" />

						<RHFTextField
							name="password"
							label="Contraseña"
							type={showPassword ? "text" : "password"}
							autoComplete="new-password"
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

						{passwordValue && (
							<Box>
								<LinearProgress
									variant="determinate"
									value={(strength.score / 4) * 100}
									color={strength.color}
									sx={{ height: 6, borderRadius: 3 }}
								/>
								<Typography variant="caption" color={`${strength.color}.main`} sx={{ mt: 0.5, display: "block" }}>
									{strength.label}
								</Typography>
							</Box>
						)}

						<RHFTextField
							name="confirmPassword"
							label="Confirmar contraseña"
							type={showConfirm ? "text" : "password"}
							autoComplete="new-password"
							slotProps={{
								input: {
									endAdornment: (
										<InputAdornment position="end">
											<IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end">
												<Iconify icon={showConfirm ? "solar:eye-bold" : "solar:eye-closed-bold"} />
											</IconButton>
										</InputAdornment>
									),
								},
							}}
						/>

						<RHFCheckbox
							name="acceptTerms"
							label={
								<Typography variant="body2">
									Acepto los{" "}
									<Link href="#" underline="always">
										términos y condiciones
									</Link>{" "}
									y el{" "}
									<Link href="#" underline="always">
										tratamiento de datos personales
									</Link>{" "}
									(Ley 1581 de 2012)
								</Typography>
							}
						/>

						<LoadingButton
							fullWidth
							size="large"
							type="submit"
							variant="contained"
							loading={isSubmitting}
						>
							Registrarse
						</LoadingButton>
					</Stack>
				</FormProvider>
			</Stack>

			<Dialog open={dialogOpen} onClose={handleDialogClose}>
				<DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Iconify icon="solar:mailbox-bold-duotone" width={28} sx={{ color: "primary.main" }} />
					Verifica tu correo electrónico
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Hemos enviado un correo de confirmación a <strong>{registeredEmail}</strong>. Por favor,
						revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para activar
						tu cuenta. No podrás acceder al portal hasta confirmar tu identidad.
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleDialogClose} variant="contained">
						Entendido
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}
