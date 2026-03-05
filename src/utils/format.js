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

export function fShortenNumber(value) {
	if (value == null || isNaN(value)) return "0";
	const abs = Math.abs(value);
	if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
	if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
	return value.toString();
}
