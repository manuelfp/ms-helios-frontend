import React from "react";

import Box from "@mui/material/Box";

import { RouterLink } from "./link";

const LOGO_SOURCES = {
	standard: "/logo-helios.png",
	dark: "/logo-helios-dark.png",
	mini: "/logo-helios-mini.png",
};

const DEFAULT_HEIGHTS = {
	standard: 40,
	dark: 40,
	mini: 36,
};

/**
 * Logo component with variant support.
 *
 * @param {"standard" | "dark" | "mini"} variant
 *   - `standard` – white text logo, for dark backgrounds (default)
 *   - `dark`     – dark text logo, for light/white backgrounds
 *   - `mini`     – icon-only mark, for compact spaces (corners, mobile headers)
 */
export const Logo = React.forwardRef(function Logo(
	{ sx, disableLink = false, variant = "standard", ...other },
	ref
) {
	const logo = (
		<Box
			ref={ref}
			component="img"
			src={LOGO_SOURCES[variant] ?? LOGO_SOURCES.standard}
			alt="Helios - Sistema de Información"
			sx={{
				height: DEFAULT_HEIGHTS[variant] ?? DEFAULT_HEIGHTS.standard,
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
