import { Controller, useFormContext } from "react-hook-form";

import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export function RHFSelect({ name, label, options = [], helperText, ...other }) {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<FormControl fullWidth error={!!error}>
					<InputLabel>{label}</InputLabel>
					<Select {...field} label={label} value={field.value ?? ""} {...other}>
						{options.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</Select>
					{(error || helperText) && (
						<FormHelperText error={!!error}>{error?.message ?? helperText}</FormHelperText>
					)}
				</FormControl>
			)}
		/>
	);
}
