import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "helios_expert_mode";

const ExpertModeContext = createContext(null);

export function ExpertModeProvider({ children }) {
	const [expertMode, setExpertModeState] = useState(() => {
		try {
			return localStorage.getItem(STORAGE_KEY) === "1";
		} catch {
			return false;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, expertMode ? "1" : "0");
		} catch {
			/* ignore */
		}
	}, [expertMode]);

	const setExpertMode = useCallback((v) => {
		setExpertModeState(!!v);
	}, []);

	const value = useMemo(() => ({ expertMode, setExpertMode }), [expertMode, setExpertMode]);

	return <ExpertModeContext.Provider value={value}>{children}</ExpertModeContext.Provider>;
}

export function useExpertMode() {
	const ctx = useContext(ExpertModeContext);
	if (!ctx) return { expertMode: false, setExpertMode: () => {} };
	return ctx;
}
