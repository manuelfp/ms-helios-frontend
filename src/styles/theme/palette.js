const PRIMARY = {
	lighter: "#D6E4FF",
	light: "#576E8A",
	main: "#2E3B4E",
	dark: "#222D3E",
	darker: "#171F2C",
	contrastText: "#FFFFFF",
};

const SECONDARY = {
	lighter: "#FFF3D0",
	light: "#F5C44E",
	main: "#F2A900",
	dark: "#C48A00",
	darker: "#8A6100",
	contrastText: "#2E3B4E",
};

const SUCCESS = {
	lighter: "#D8E8D4",
	light: "#6B8F62",
	main: "#4A6741",
	dark: "#354D30",
	darker: "#1F2E1C",
	contrastText: "#FFFFFF",
};

const ERROR = {
	lighter: "#FFE7E7",
	light: "#E57373",
	main: "#C62828",
	dark: "#8E0000",
	darker: "#5C0000",
	contrastText: "#FFFFFF",
};

const WARNING = {
	lighter: "#FFF4E5",
	light: "#FFB74D",
	main: "#ED6C02",
	dark: "#E65100",
	darker: "#BF360C",
	contrastText: "#FFFFFF",
};

const INFO = {
	lighter: "#E3F2FD",
	light: "#64B5F6",
	main: "#1976D2",
	dark: "#0D47A1",
	darker: "#0A2F6B",
	contrastText: "#FFFFFF",
};

const GREY = {
	0: "#FFFFFF",
	100: "#F9FAFB",
	200: "#F4F6F8",
	300: "#DFE3E8",
	400: "#C4CDD5",
	500: "#919EAB",
	600: "#637381",
	700: "#454F5B",
	800: "#212B36",
	900: "#161C24",
};

export function palette() {
	return {
		primary: PRIMARY,
		secondary: SECONDARY,
		success: SUCCESS,
		error: ERROR,
		warning: WARNING,
		info: INFO,
		grey: GREY,
		common: {
			black: "#000000",
			white: "#FFFFFF",
		},
		text: {
			primary: GREY[800],
			secondary: GREY[600],
			disabled: GREY[500],
		},
		background: {
			paper: "#FFFFFF",
			default: "#F9FAFB",
			neutral: GREY[200],
		},
		action: {
			hover: "rgba(46, 59, 78, 0.08)",
			selected: "rgba(46, 59, 78, 0.12)",
			disabled: "rgba(46, 59, 78, 0.26)",
			disabledBackground: "rgba(46, 59, 78, 0.12)",
			focus: "rgba(46, 59, 78, 0.12)",
		},
		divider: GREY[300],
	};
}
