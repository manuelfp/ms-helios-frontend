import { useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Iconify } from "@/components/core";

/**
 * @param {{ methodology?: { title?: string; ocpRef?: string; steps?: string[]; fields?: string[] } | null; defaultExpanded?: boolean }} props
 */
export function MethodologyInfo({ methodology, defaultExpanded = false }) {
	const [expanded, setExpanded] = useState(defaultExpanded);

	if (!methodology) return null;

	return (
		<Accordion expanded={expanded} onChange={(_, v) => setExpanded(v)} sx={{ borderRadius: 2, "&:before": { display: "none" } }}>
			<AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold-duotone" width={20} />}>
				<Stack direction="row" alignItems="center" spacing={1}>
					<Iconify icon="solar:document-text-bold-duotone" width={22} color="primary" />
					<Typography fontWeight={600}>Metodología</Typography>
					{methodology.ocpRef && (
						<Typography variant="caption" color="text.secondary">
							({methodology.ocpRef})
						</Typography>
					)}
				</Stack>
			</AccordionSummary>
			<AccordionDetails>
				<Stack spacing={1.5}>
					{methodology.title && (
						<Typography variant="subtitle2">{methodology.title}</Typography>
					)}
					{methodology.steps?.length > 0 && (
						<Stack component="ol" spacing={0.75} sx={{ m: 0, pl: 2.5 }}>
							{methodology.steps.map((step, i) => (
								<Typography key={i} component="li" variant="body2" color="text.secondary">
									{step}
								</Typography>
							))}
						</Stack>
					)}
					{methodology.fields?.length > 0 && (
						<Typography variant="caption" color="text.disabled">
							Campos clave: {methodology.fields.join(", ")}
						</Typography>
					)}
				</Stack>
			</AccordionDetails>
		</Accordion>
	);
}
