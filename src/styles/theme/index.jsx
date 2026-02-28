import { useMemo } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material/styles";

import { components } from "./components";
import { palette } from "./palette";
import { typography } from "./typography";

export function ThemeProvider({ children }) {
	const themeOptions = useMemo(() => {
		const pal = palette();
		return {
			palette: pal,
			typography: typography(),
			shape: { borderRadius: 8 },
		};
	}, []);

	const theme = createTheme(themeOptions);

	theme.components = components(theme);

	return (
		<MuiThemeProvider theme={theme}>
			<CssBaseline />
			{children}
		</MuiThemeProvider>
	);
}
