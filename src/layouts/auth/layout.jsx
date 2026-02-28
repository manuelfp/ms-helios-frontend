import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Logo } from "@/components/core";

export function AuthLayout({ children }) {
	return (
		<Box sx={{ display: "flex", minHeight: "100vh" }}>
			{/* Left panel - branding */}
			<Box
				sx={{
					display: { xs: "none", md: "flex" },
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					width: "50%",
					background: "linear-gradient(135deg, #2E3B4E 0%, #222D3E 60%, #171F2C 100%)",
					color: "white",
					p: 6,
					position: "relative",
					overflow: "hidden",
				}}
			>
				{/* Decorative circles */}
				<Box
					sx={{
						position: "absolute",
						width: 400,
						height: 400,
						borderRadius: "50%",
						border: "1px solid rgba(242, 169, 0, 0.1)",
						top: -100,
						right: -100,
					}}
				/>
				<Box
					sx={{
						position: "absolute",
						width: 300,
						height: 300,
						borderRadius: "50%",
						border: "1px solid rgba(242, 169, 0, 0.08)",
						bottom: -80,
						left: -80,
					}}
				/>

				<Stack spacing={4} alignItems="center" sx={{ position: "relative", zIndex: 1, maxWidth: 420, textAlign: "center" }}>
					<Box
						component="img"
						src="/logo-helios.png"
						alt="Helios - Sistema de Información"
						sx={{ height: { xs: 60, md: 80 }, width: "auto", objectFit: "contain" }}
					/>

					<Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
						Transparencia y veeduría ciudadana en los procesos de contratación de las Fuerzas Militares de Colombia.
					</Typography>

					{/* MinDefensa sponsor */}
					<Stack spacing={1.5} alignItems="center" sx={{ mt: 2, pt: 3, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
						<Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)", letterSpacing: 1, textTransform: "uppercase" }}>
							Una iniciativa de
						</Typography>
						<Box
							component="img"
							src="/logo-mindefensa.png"
							alt="Ministerio de Defensa de Colombia"
							sx={{
								height: 55,
								width: "auto",
								objectFit: "contain",
								filter: "brightness(0) invert(1)",
								opacity: 0.7,
							}}
						/>
					</Stack>
				</Stack>
			</Box>

			{/* Right panel - form */}
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					flex: 1,
					p: { xs: 3, md: 6 },
					bgcolor: "background.default",
				}}
			>
				<Box sx={{ position: "absolute", top: 24, left: { xs: 24, md: "auto" }, right: { md: 24 } }}>
					<Logo />
				</Box>

				<Box sx={{ width: "100%", maxWidth: 480 }}>{children}</Box>
			</Box>
		</Box>
	);
}
