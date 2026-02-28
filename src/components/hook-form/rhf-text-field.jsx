import { Controller, useFormContext } from "react-hook-form";

import TextField from "@mui/material/TextField";

export function RHFTextField({ name, helperText, ...other }) {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<TextField
					{...field}
					fullWidth
					value={field.value ?? ""}
					error={!!error}
					helperText={error?.message ?? helperText}
					{...other}
				/>
			)}
		/>
	);
}
