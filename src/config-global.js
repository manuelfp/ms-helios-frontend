const env = window.__ENV__ || {};

function getEnv(key) {
	return env[key] || import.meta.env[key] || "";
}

export const FIREBASE_API = {
	apiKey: getEnv("VITE_FIREBASE_API_KEY"),
	authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
	projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
	storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
	messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
	appId: getEnv("VITE_FIREBASE_APP_ID"),
	measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID"),
};

export const PATH_AFTER_LOGIN = "/dashboard";
