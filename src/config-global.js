const env = window.__ENV__ || {};

function getEnv(key) {
	return env[key] || import.meta.env[key] || "";
}

export const FIREBASE_API = {
	apiKey: process.env.VITE_FIREBASE_API_KEY || getEnv("VITE_FIREBASE_API_KEY"),
	authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
	projectId: process.env.VITE_FIREBASE_PROJECT_ID || getEnv("VITE_FIREBASE_PROJECT_ID"),
	storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
	messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
	appId: process.env.VITE_FIREBASE_APP_ID || getEnv("VITE_FIREBASE_APP_ID"),
	measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || getEnv("VITE_FIREBASE_MEASUREMENT_ID"),
};

export const API_BASE_URL = process.env.VITE_API_BASE_URL || getEnv("VITE_API_BASE_URL") || "/";

export const PATH_AFTER_LOGIN = "/dashboard";
