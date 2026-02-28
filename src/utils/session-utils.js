import axios from "./axios";

export function isValidToken(accessToken) {
	if (!accessToken) return false;

	try {
		const parts = accessToken.split(".");
		if (parts.length !== 3) return false;

		const decoded = JSON.parse(atob(parts[1]));
		const currentTime = Date.now() / 1000;

		return decoded.exp > currentTime;
	} catch {
		return false;
	}
}

export function setSession(accessToken) {
	if (accessToken) {
		sessionStorage.setItem("accessToken", accessToken);
		axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
	} else {
		sessionStorage.removeItem("accessToken");
		delete axios.defaults.headers.common.Authorization;
	}
}
