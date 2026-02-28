import axios from "axios";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "/",
});

axiosInstance.interceptors.response.use(
	(res) => res,
	(error) =>
		Promise.reject(
			(error.response && error.response.data) || { message: "Ocurrió un error inesperado" }
		)
);

export default axiosInstance;

export const fetcher = async (args) => {
	const [url, config] = Array.isArray(args) ? args : [args];
	const res = await axiosInstance.get(url, { ...config });
	return res.data;
};

export const endpoints = {
	contratos: {
		list: "/api/contratos",
		detail: (id) => `/api/contratos/${id}`,
	},
	alertas: {
		list: "/api/alertas",
		detail: (id) => `/api/alertas/${id}`,
	},
	auth: {
		me: "/api/auth/me",
	},
};
