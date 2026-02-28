import { useCallback, useEffect, useMemo, useReducer } from "react";

import {
	browserSessionPersistence,
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	sendEmailVerification,
	sendPasswordResetEmail,
	setPersistence,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";

import { setSession } from "@/utils/session-utils";

import { AuthContext } from "./auth-context";
import { AUTH } from "./lib";

const initialState = {
	user: null,
	loading: true,
};

function reducer(state, action) {
	switch (action.type) {
		case "INITIAL":
			return { loading: false, user: action.payload.user };
		case "LOGIN":
			return { ...state, user: action.payload.user };
		case "REGISTER":
			return { ...state, user: action.payload.user };
		case "LOGOUT":
			return { ...state, user: null };
		default:
			return state;
	}
}

export function AuthProvider({ children }) {
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(AUTH, async (user) => {
			if (user) {
				const tokenResult = await user.getIdTokenResult();
				setSession(tokenResult.token);

				dispatch({
					type: "INITIAL",
					payload: {
						user: {
							uid: user.uid,
							email: user.email,
							displayName: user.displayName,
							emailVerified: user.emailVerified,
							photoURL: user.photoURL,
						},
					},
				});
			} else {
				setSession(null);
				dispatch({ type: "INITIAL", payload: { user: null } });
			}
		});

		return () => unsubscribe();
	}, []);

	const login = useCallback(async (email, password) => {
		await setPersistence(AUTH, browserSessionPersistence);
		const userCredential = await signInWithEmailAndPassword(AUTH, email, password);
		const { user } = userCredential;

		const tokenResult = await user.getIdTokenResult();
		setSession(tokenResult.token);

		dispatch({
			type: "LOGIN",
			payload: {
				user: {
					uid: user.uid,
					email: user.email,
					displayName: user.displayName,
					emailVerified: user.emailVerified,
					photoURL: user.photoURL,
				},
			},
		});
	}, []);

	const register = useCallback(async (email, password, displayName) => {
		await setPersistence(AUTH, browserSessionPersistence);
		const userCredential = await createUserWithEmailAndPassword(AUTH, email, password);
		const { user } = userCredential;

		await sendEmailVerification(user);

		dispatch({
			type: "REGISTER",
			payload: {
				user: {
					uid: user.uid,
					email: user.email,
					displayName: displayName || user.displayName,
					emailVerified: user.emailVerified,
					photoURL: user.photoURL,
				},
			},
		});
	}, []);

	const logout = useCallback(async () => {
		await signOut(AUTH);
		setSession(null);
		dispatch({ type: "LOGOUT" });
	}, []);

	const forgotPassword = useCallback(async (email) => {
		await sendPasswordResetEmail(AUTH, email);
	}, []);

	const resendVerification = useCallback(async () => {
		if (AUTH.currentUser) {
			await sendEmailVerification(AUTH.currentUser);
		}
	}, []);

	const contextValue = useMemo(
		() => ({
			user: state.user,
			loading: state.loading,
			authenticated: !!state.user,
			unauthenticated: !state.user,
			login,
			register,
			logout,
			forgotPassword,
			resendVerification,
		}),
		[state.user, state.loading, login, register, logout, forgotPassword, resendVerification]
	);

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
