import { lazy, Suspense } from "react";

import { Outlet } from "react-router-dom";

import { AuthGuard } from "@/auth/guard/auth-guard";
import { LoadingScreen } from "@/components/core";
import { DashboardLayout } from "@/layouts/dashboard/layout";

const OverviewPage = lazy(() => import("@/pages/dashboard/overview"));
const ContratosPage = lazy(() => import("@/pages/dashboard/contratos"));
const ConsultaIAPage = lazy(() => import("@/pages/dashboard/consulta-ia"));
const InvestigacionPage = lazy(() => import("@/pages/dashboard/investigacion"));
const EstadisticasPage = lazy(() => import("@/pages/dashboard/estadisticas"));

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
			{ path: "consulta-ia", element: <ConsultaIAPage /> },
			{ path: "investigacion", element: <InvestigacionPage /> },
			{ path: "estadisticas", element: <EstadisticasPage /> },
		],
	},
];
