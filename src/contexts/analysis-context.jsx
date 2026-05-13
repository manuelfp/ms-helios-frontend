import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
	const [subject, setSubjectState] = useState(null);

	const setSubject = useCallback((doc, extra = {}) => {
		const d = String(doc || "").trim();
		if (!d) {
			setSubjectState(null);
			return;
		}
		setSubjectState({ documento: d, ...extra });
	}, []);

	const clearSubject = useCallback(() => setSubjectState(null), []);

	const value = useMemo(
		() => ({ subject, setSubject, clearSubject }),
		[subject, setSubject, clearSubject],
	);

	return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysisContext() {
	const ctx = useContext(AnalysisContext);
	if (!ctx) {
		return { subject: null, setSubject: () => {}, clearSubject: () => {} };
	}
	return ctx;
}
