import { Toaster } from "sonner";

import { AuthProvider } from "@/auth/context";
import { PrivacyProvider } from "@/contexts/privacy-context";
import { ThemeProvider } from "@/styles/theme";

export function Root({ children }) {
	return (
		<AuthProvider>
			<ThemeProvider>
				<PrivacyProvider>
					<Toaster position="top-right" richColors closeButton />
					{children}
				</PrivacyProvider>
			</ThemeProvider>
		</AuthProvider>
	);
}
