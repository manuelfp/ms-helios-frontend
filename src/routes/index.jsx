import { lazy, Suspense } from "react";

import { Navigate } from "react-router-dom";

import { LoadingScreen } from "@/components/core";

import { authRoutes } from "./auth";
import { dashboardRoutes } from "./dashboard";

const LandingPage = lazy(() => import("@/pages/landing"));
const NotFoundPage = lazy(() => import("@/pages/errors/not-found"));

export const routes = [
	{
		path: "/",
		element: (
			<Suspense fallback={<LoadingScreen />}>
				<LandingPage />
			</Suspense>
		),
	},
	...authRoutes,
	...dashboardRoutes,
	{
		path: "404",
		element: (
			<Suspense fallback={<LoadingScreen />}>
				<NotFoundPage />
			</Suspense>
		),
	},
	{ path: "*", element: <Navigate to="/404" replace /> },
];
