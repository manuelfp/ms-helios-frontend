export const paths = {
	landing: "/",
	auth: {
		login: "/auth/login",
		register: "/auth/register",
		verify: "/auth/verify",
		forgotPassword: "/auth/forgot-password",
	},
	dashboard: {
		root: "/dashboard",
		contratos: "/dashboard/contratos",
		consultaIA: "/dashboard/consulta-ia",
		investigacion: "/dashboard/investigacion",
		investigarDoc: (doc) => `/dashboard/investigacion?doc=${encodeURIComponent(doc)}`,
		estadisticas: "/dashboard/estadisticas",
		alertas: "/dashboard/alertas",
		alertasAt01: "/dashboard/alertas/at-01",
		alertasAt02: "/dashboard/alertas/at-02",
		alertasAt03: "/dashboard/alertas/at-03",
		alertasAt04: "/dashboard/alertas/at-04",
		alertasAt05: "/dashboard/alertas/at-05",
		alertasAt06: "/dashboard/alertas/at-06",
		alertasAt07: "/dashboard/alertas/at-07",
		metodologia: "/dashboard/metodologia",
		perfilProveedor: (documento) => `/dashboard/perfil-proveedor/${encodeURIComponent(documento)}`,
		perfilEntidad: (nit) => `/dashboard/perfil-entidad/${encodeURIComponent(nit)}`,
	},
	notFound: "/404",
};

export function isValidNitOrDoc(value) {
	if (value == null) return false;
	const s = String(value).trim();
	if (s === "") return false;
	if (/^0+$/.test(s)) return false;
	return true;
}
