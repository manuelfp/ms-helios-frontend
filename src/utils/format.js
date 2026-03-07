export function fCurrency(value) {
	if (value == null || isNaN(value)) return "$0";
	const abs = Math.abs(value);
	if (abs >= 1e12) return `$${(value / 1e12).toFixed(1)}B`;
	if (abs >= 1e9) return `$${(value / 1e9).toFixed(1)}MM`;
	if (abs >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
	if (abs >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
	return `$${value.toLocaleString("es-CO")}`;
}

export function fNumber(value) {
	if (value == null || isNaN(value)) return "0";
	return Number(value).toLocaleString("es-CO");
}

/**
 * Masks a sensitive name string by keeping the first character of each word
 * and replacing the rest with asterisks.
 * e.g. "EMPRESA CONSTRUCTORA S.A.S." → "E****** C*********** S.A.S."
 */
export function maskName(str, visibleChars = 1, maskChar = "▮") {
	if (!str || typeof str !== "string") return str;
	return str
		.split(" ")
		.map((word) => {
			if (visibleChars === 0) return maskChar.repeat(word.length);
			if (word.length <= visibleChars) return word;
			return word.slice(0, visibleChars) + maskChar.repeat(word.length - visibleChars);
		})
		.join(" ");
}

/**
 * Masks a document/ID number showing only the last `visibleDocChars` characters.
 * e.g. visibleDocChars=3: "900123456-1" → "▮▮▮▮▮▮▮▮56-1"  (wait, that's wrong, let me recount)
 * e.g. visibleDocChars=3: "900123456"   → "▮▮▮▮▮▮456"
 * e.g. visibleDocChars=0: "900123456"   → "▮▮▮▮▮▮▮▮▮"
 */
export function maskDoc(str, visibleDocChars = 3, maskChar = "▮") {
	if (!str || typeof str !== "string") return str;
	if (visibleDocChars === 0) return maskChar.repeat(str.length);
	if (str.length <= visibleDocChars) return str;
	return maskChar.repeat(str.length - visibleDocChars) + str.slice(-visibleDocChars);
}

export function fShortenNumber(value) {
	if (value == null || isNaN(value)) return "0";
	const abs = Math.abs(value);
	if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
	if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
	return value.toString();
}
