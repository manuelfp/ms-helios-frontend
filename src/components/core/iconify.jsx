import React from "react";

import { Icon } from "@iconify/react";
import Box from "@mui/material/Box";

export const Iconify = React.forwardRef(function Iconify({ icon, width = 20, sx, ...other }, ref) {
	return (
		<Box
			ref={ref}
			component={Icon}
			className="iconify"
			icon={icon}
			sx={{ width, height: width, flexShrink: 0, ...sx }}
			{...other}
		/>
	);
});
