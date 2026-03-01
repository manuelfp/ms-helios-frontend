import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Iconify } from "@/components/core";
import { useCountUp } from "@/hooks/use-count-up";

/**
 * Stat card with an animated count-up effect on viewport entry.
 *
 * @param {{ title: string, value: number, icon: string, color: string, bgcolor: string }} stat
 */
export function StatCard({ stat }) {
	const { count, ref } = useCountUp(stat.value);

	return (
		<Card ref={ref}>
			<CardContent>
				<Stack direction="row" alignItems="center" spacing={2}>
					<Box
						sx={{
							width: 56,
							height: 56,
							borderRadius: 2,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							bgcolor: stat.bgcolor,
							flexShrink: 0,
						}}
					>
						<Iconify icon={stat.icon} width={28} sx={{ color: stat.color }} />
					</Box>

					<Stack spacing={0.5}>
						<Typography variant="h4">{count.toLocaleString("en-US")}</Typography>
						<Typography variant="caption" color="text.secondary">
							{stat.title}
						</Typography>
					</Stack>
				</Stack>
			</CardContent>
		</Card>
	);
}
