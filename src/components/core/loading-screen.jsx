import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export function LoadingScreen({ sx }) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexGrow: 1,
				minHeight: "100vh",
				...sx,
			}}
		>
			<CircularProgress color="primary" size={48} />
		</Box>
	);
}
