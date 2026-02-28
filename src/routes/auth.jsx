import { lazy, Suspense } from "react";

import { Outlet } from "react-router-dom";

import { GuestGuard } from "@/auth/guard/guest-guard";
import { LoadingScreen } from "@/components/core";
import { AuthLayout } from "@/layouts/auth/layout";

const LoginPage = lazy(() => import("@/pages/auth/login"));
const RegisterPage = lazy(() => import("@/pages/auth/register"));
const VerifyPage = lazy(() => import("@/pages/auth/verify"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));

export const authRoutes = [
	{
		path: "auth",
		element: (
			<Suspense fallback={<LoadingScreen />}>
				<Outlet />
			</Suspense>
		),
		children: [
			{
				path: "login",
				element: (
					<GuestGuard>
						<AuthLayout>
							<LoginPage />
						</AuthLayout>
					</GuestGuard>
				),
			},
			{
				path: "register",
				element: (
					<GuestGuard>
						<AuthLayout>
							<RegisterPage />
						</AuthLayout>
					</GuestGuard>
				),
			},
			{
				path: "verify",
				element: (
					<AuthLayout>
						<VerifyPage />
					</AuthLayout>
				),
			},
			{
				path: "forgot-password",
				element: (
					<AuthLayout>
						<ForgotPasswordPage />
					</AuthLayout>
				),
			},
		],
	},
];
