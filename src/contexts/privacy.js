import { createContext } from "react";

export const VISIBLE_CHARS = 1;
// Caracteres visibles al FINAL de un token (documentos, NITs, etc.).
export const VISIBLE_LAST_CHARS = 3;
export const MASK_CHAR = "•";

export const PrivacyContext = createContext({
	obfuscate: false,
	setObfuscate: () => {},
	visibleChars: VISIBLE_CHARS,
	visibleLastChars: VISIBLE_LAST_CHARS,
	maskChar: MASK_CHAR,
});
