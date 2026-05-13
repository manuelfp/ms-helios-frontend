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
const AlertasPage = lazy(() => import("@/pages/dashboard/alertas"));
const AlertasAt01Page = lazy(() => import("@/pages/dashboard/alertas/at-01"));
const AlertasAt02Page = lazy(() => import("@/pages/dashboard/alertas/at-02"));
const AlertasAt03Page = lazy(() => import("@/pages/dashboard/alertas/at-03"));
const AlertasAt04Page = lazy(() => import("@/pages/dashboard/alertas/at-04"));
const AlertasAt05Page = lazy(() => import("@/pages/dashboard/alertas/at-05"));
const AlertasAt06Page = lazy(() => import("@/pages/dashboard/alertas/at-06"));
const AlertasAt07Page = lazy(() => import("@/pages/dashboard/alertas/at-07"));
const MetodologiaPage = lazy(() => import("@/pages/dashboard/metodologia"));
const PerfilProveedorPage = lazy(() => import("@/pages/dashboard/perfil-proveedor"));
const PerfilEntidadPage = lazy(() => import("@/pages/dashboard/perfil-entidad"));

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
			{ path: "alertas", element: <AlertasPage /> },
			{ path: "alertas/at-01", element: <AlertasAt01Page /> },
			{ path: "alertas/at-02", element: <AlertasAt02Page /> },
			{ path: "alertas/at-03", element: <AlertasAt03Page /> },
			{ path: "alertas/at-04", element: <AlertasAt04Page /> },
			{ path: "alertas/at-05", element: <AlertasAt05Page /> },
			{ path: "alertas/at-06", element: <AlertasAt06Page /> },
			{ path: "alertas/at-07", element: <AlertasAt07Page /> },
			{ path: "metodologia", element: <MetodologiaPage /> },
			{ path: "perfil-proveedor/:documento", element: <PerfilProveedorPage /> },
			{ path: "perfil-entidad/:nit", element: <PerfilEntidadPage /> },
		],
	},
];
