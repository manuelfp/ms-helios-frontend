import React from "react";

import Box from "@mui/material/Box";

import { RouterLink } from "./link";

export const Logo = React.forwardRef(function Logo({ sx, disableLink = false, ...other }, ref) {
	const logo = (
		<Box
			ref={ref}
			component="img"
			src="/logo-helios.png"
			alt="Helios - Sistema de Información"
			sx={{
				height: 40,
				width: "auto",
				objectFit: "contain",
				...sx,
			}}
			{...other}
		/>
	);

	if (disableLink) {
		return logo;
	}

	return (
		<RouterLink href="/" sx={{ display: "inline-flex", textDecoration: "none" }}>
			{logo}
		</RouterLink>
	);
});
