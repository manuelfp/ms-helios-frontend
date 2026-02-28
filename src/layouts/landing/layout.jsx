import Box from "@mui/material/Box";

export function LandingLayout({ children }) {
	return (
		<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
			{children}
		</Box>
	);
}
