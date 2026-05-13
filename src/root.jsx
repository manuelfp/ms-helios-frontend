import { Toaster } from "sonner";

import { AuthProvider } from "@/auth/context";
import { AnalysisProvider } from "@/contexts/analysis-context";
import { ExpertModeProvider } from "@/contexts/expert-mode-context";
import { PrivacyProvider } from "@/contexts/privacy-context";
import { ThemeProvider } from "@/styles/theme";

export function Root({ children }) {
	return (
		<AuthProvider>
			<ThemeProvider>
				<PrivacyProvider>
					<ExpertModeProvider>
						<AnalysisProvider>
							<Toaster position="top-right" richColors closeButton />
							{children}
						</AnalysisProvider>
					</ExpertModeProvider>
				</PrivacyProvider>
			</ThemeProvider>
		</AuthProvider>
	);
}
