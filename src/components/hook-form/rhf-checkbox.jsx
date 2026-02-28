import { Controller, useFormContext } from "react-hook-form";

import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";

export function RHFCheckbox({ name, label, helperText, ...other }) {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<>
					<FormControlLabel
						control={<Checkbox {...field} checked={!!field.value} {...other} />}
						label={label}
					/>
					{(error || helperText) && (
						<FormHelperText error={!!error} sx={{ mx: 0 }}>
							{error?.message ?? helperText}
						</FormHelperText>
					)}
				</>
			)}
		/>
	);
}
