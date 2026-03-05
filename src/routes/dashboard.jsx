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
const Neo4jAlertasConcentracionPage = lazy(() => import("@/pages/dashboard/neo4j-alertas-concentracion"));
const Neo4jAlertasTempranas = lazy(() => import("@/pages/dashboard/neo4j-alertas-tempranas"));
const Neo4jAnalisisRelacionPage = lazy(() => import("@/pages/dashboard/neo4j-analisis-relacion"));

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
			{ path: "neo4j-alertas-concentracion", element: <Neo4jAlertasConcentracionPage /> },
			{ path: "neo4j-alertas-tempranas", element: <Neo4jAlertasTempranas /> },
			{ path: "neo4j-analisis-relacion", element: <Neo4jAnalisisRelacionPage /> },
		],
	},
];
