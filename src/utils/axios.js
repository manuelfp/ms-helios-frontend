import axios from "axios";

const axiosInstance = axios.create({
	baseURL: "/",
	timeout: 120000,
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
