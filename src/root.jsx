import { Toaster } from "sonner";

import { AuthProvider } from "@/auth/context";
import { ThemeProvider } from "@/styles/theme";

export function Root({ children }) {
	return (
		<AuthProvider>
			<ThemeProvider>
				<Toaster position="top-right" richColors closeButton />
				{children}
			</ThemeProvider>
		</AuthProvider>
	);
}
