import { lazy, Suspense } from "react";

import { Outlet } from "react-router-dom";

import { AuthGuard } from "@/auth/guard/auth-guard";
import { LoadingScreen } from "@/components/core";
import { DashboardLayout } from "@/layouts/dashboard/layout";

const OverviewPage = lazy(() => import("@/pages/dashboard/overview"));
const ContratosPage = lazy(() => import("@/pages/dashboard/contratos"));
const AlertasPage = lazy(() => import("@/pages/dashboard/alertas"));

export const dashboardRoutes = [
	{
		path: "dashboard",
		element: (
			<AuthGuard>
				<DashboardLayout>
					<Suspense fallback={<LoadingScreen sx={{ minHeight: "50vh" }} />}>
						<Outlet />
					</Suspense>
				</DashboardLayout>
			</AuthGuard>
		),
		children: [
			{ index: true, element: <OverviewPage /> },
			{ path: "contratos", element: <ContratosPage /> },
			{ path: "alertas", element: <AlertasPage /> },
		],
	},
];
