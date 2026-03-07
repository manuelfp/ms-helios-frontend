import { useState } from "react";

import { MASK_CHAR, VISIBLE_CHARS, VISIBLE_LAST_CHARS, PrivacyContext } from "./privacy";

export function PrivacyProvider({ children }) {
	const [obfuscate, setObfuscate] = useState(false);
	return (
		<PrivacyContext.Provider value={{ obfuscate, setObfuscate, visibleChars: VISIBLE_CHARS, visibleLastChars: VISIBLE_LAST_CHARS, maskChar: MASK_CHAR }}>
			{children}
		</PrivacyContext.Provider>
	);
}
