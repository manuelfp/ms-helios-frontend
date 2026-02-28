import { useCallback, useEffect, useState } from "react";

import { useNavigate, useLocation } from "react-router-dom";

import { LoadingScreen } from "@/components/core";

import { useAuthContext } from "../hooks/use-auth-context";

export function AuthGuard({ children }) {
	const { loading } = useAuthContext();

	return loading ? <LoadingScreen /> : <Container>{children}</Container>;
}

function Container({ children }) {
	const { authenticated } = useAuthContext();
	const navigate = useNavigate();
	const location = useLocation();
	const [checked, setChecked] = useState(false);

	const check = useCallback(() => {
		if (!authenticated) {
			const searchParams = new URLSearchParams({ returnTo: location.pathname });
			navigate(`/auth/login?${searchParams.toString()}`, { replace: true });
		} else {
			setChecked(true);
		}
	}, [authenticated, location.pathname, navigate]);

	useEffect(() => {
		check();
	}, [check]);

	if (!checked) {
		return null;
	}

	return <>{children}</>;
}
