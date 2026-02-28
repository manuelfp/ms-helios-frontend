import { useCallback, useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { LoadingScreen } from "@/components/core";
import { PATH_AFTER_LOGIN } from "@/config-global";

import { useAuthContext } from "../hooks/use-auth-context";

export function GuestGuard({ children }) {
	const { loading } = useAuthContext();

	return loading ? <LoadingScreen /> : <Container>{children}</Container>;
}

function Container({ children }) {
	const { authenticated } = useAuthContext();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [checked, setChecked] = useState(false);

	const returnTo = searchParams.get("returnTo") || PATH_AFTER_LOGIN;

	const check = useCallback(() => {
		if (authenticated) {
			navigate(returnTo, { replace: true });
		} else {
			setChecked(true);
		}
	}, [authenticated, navigate, returnTo]);

	useEffect(() => {
		check();
	}, [check]);

	if (!checked) {
		return null;
	}

	return <>{children}</>;
}
