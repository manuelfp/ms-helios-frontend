export function components(theme) {
	return {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					fontWeight: 600,
					padding: "8px 22px",
				},
				containedPrimary: {
				boxShadow: "0 4px 12px rgba(46, 59, 78, 0.24)",
				"&:hover": {
					boxShadow: "0 6px 16px rgba(46, 59, 78, 0.32)",
					},
				},
				containedSecondary: {
					boxShadow: "0 4px 12px rgba(242, 169, 0, 0.24)",
					"&:hover": {
						boxShadow: "0 6px 16px rgba(242, 169, 0, 0.32)",
					},
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 16,
					boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
				},
			},
		},
		MuiTextField: {
			defaultProps: {
				variant: "outlined",
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
						borderColor: theme.palette.primary.main,
					},
				},
			},
		},
		MuiAlert: {
			styleOverrides: {
				root: {
					borderRadius: 8,
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
			},
		},
		MuiLink: {
			defaultProps: {
				underline: "hover",
			},
		},
	};
}
