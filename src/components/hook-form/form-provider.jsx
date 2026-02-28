import { FormProvider as RHFFormProvider } from "react-hook-form";

export function FormProvider({ children, onSubmit, methods }) {
	return (
		<RHFFormProvider {...methods}>
			<form onSubmit={onSubmit} noValidate autoComplete="off">
				{children}
			</form>
		</RHFFormProvider>
	);
}
