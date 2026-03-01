import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Iconify, Logo } from "@/components/core";
import { RouterLink } from "@/components/core/link";
import { paths } from "@/paths";

export function HeroSection() {
	return (
		<Box
			sx={{
				position: "relative",
				overflow: "hidden",
				background: "linear-gradient(135deg, #2E3B4E 0%, #222D3E 50%, #171F2C 100%)",
				color: "white",
				py: { xs: 10, md: 16 },
			}}
		>
			{/* Decorative elements */}
			<Box
				sx={{
					position: "absolute",
					top: "10%",
					right: "5%",
					width: { xs: 200, md: 400 },
					height: { xs: 200, md: 400 },
					borderRadius: "50%",
					border: "1px solid rgba(242, 169, 0, 0.12)",
				}}
			/>
			<Box
				sx={{
					position: "absolute",
					bottom: "5%",
					left: "10%",
					width: { xs: 150, md: 300 },
					height: { xs: 150, md: 300 },
					borderRadius: "50%",
					border: "1px solid rgba(242, 169, 0, 0.08)",
				}}
			/>
			<Box
				sx={{
					position: "absolute",
					top: "30%",
					left: "50%",
					width: 200,
					height: 200,
					borderRadius: "50%",
					background: "radial-gradient(circle, rgba(242,169,0,0.06) 0%, transparent 70%)",
				}}
			/>

			<Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
				<Stack spacing={4} alignItems="center" textAlign="center" maxWidth={800} mx="auto">
					{/* Logo principal Helios */}
					<Logo
						disableLink
						sx={{ height: { xs: 60, md: 90 } }}
					/>

					<Typography
						variant="h1"
						sx={{
							fontSize: { xs: "2rem", md: "3.25rem" },
							fontWeight: 800,
							lineHeight: 1.15,
							background: "linear-gradient(to right, #FFFFFF, #F2A900)",
							backgroundClip: "text",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
						}}
					>
						Transparencia y Veeduría en las Fuerzas Militares
					</Typography>

					<Typography
						variant="h6"
						sx={{
							color: "rgba(255,255,255,0.7)",
							fontWeight: 400,
							maxWidth: 650,
							lineHeight: 1.7,
							fontSize: { xs: "1rem", md: "1.125rem" },
						}}
					>
						Conoce, audita y protege los recursos de Colombia. Una herramienta ciudadana impulsada por
						Inteligencia Artificial para garantizar procesos de contratación limpios en el Ministerio de Defensa.
					</Typography>

					<Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 2 }}>
						<Button
							component={RouterLink}
							href={paths.auth.login}
							variant="contained"
							size="large"
							sx={{
								bgcolor: "#F2A900",
								color: "#2E3B4E",
								fontWeight: 700,
								px: 4,
								py: 1.5,
								"&:hover": { bgcolor: "#D99600" },
							}}
							startIcon={<Iconify icon="solar:login-2-bold-duotone" />}
						>
							Ingresar al Portal
						</Button>

						<Button
							component={RouterLink}
							href={paths.auth.register}
							variant="outlined"
							size="large"
							sx={{
								borderColor: "rgba(255,255,255,0.3)",
								color: "white",
								fontWeight: 600,
								px: 4,
								py: 1.5,
								"&:hover": { borderColor: "rgba(255,255,255,0.6)", bgcolor: "rgba(255,255,255,0.05)" },
							}}
							startIcon={<Iconify icon="solar:user-plus-bold-duotone" />}
						>
							Crear Cuenta de Veedor
						</Button>
					</Stack>

					{/* MinDefensa sponsor badge */}
					<Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 2, opacity: 0.5 }}>
						<Typography variant="caption" sx={{ color: "white", letterSpacing: 0.5 }}>
							Una iniciativa del
						</Typography>
						<Box
							component="img"
							src="/logo-mindefensa.png"
							alt="Ministerio de Defensa de Colombia"
							sx={{
								height: 32,
								width: "auto",
								objectFit: "contain",
								filter: "brightness(0) invert(1)",
							}}
						/>
					</Stack>
				</Stack>
			</Container>
		</Box>
	);
}
